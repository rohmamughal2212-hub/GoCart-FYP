import Stripe from "stripe";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";
import { sendEmail, orderConfirmationEmail } from "../config/email.js";
import User from "../models/user.model.js";
import { decrementProductStockFallback, findProductByIdFallback } from "../config/fallbackDb.js";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);
const SHIPPING_CHARGE = 250;

const createStockError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const loadProductForOrder = async (id) => {
  try {
    const product = await Product.findById(id);
    if (product) return product;
  } catch {
    // Fall back to the persisted catalog for non-Mongo product IDs.
  }
  return findProductByIdFallback(id);
};

const validateOrderStock = async (items) => {
  const requirements = new Map();
  for (const item of items) {
    if (!item?.product || item.quantity == null) {
      throw createStockError("Invalid cart item data");
    }
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw createStockError("Invalid item quantity");
    }
    const productId = String(item.product?._id || item.product);
    requirements.set(productId, (requirements.get(productId) || 0) + quantity);
  }

  const products = new Map();
  for (const [productId, quantity] of requirements) {
    const product = await loadProductForOrder(productId);
    if (!product) throw createStockError(`Product ${productId} not found`);
    const availableStock = Number.isFinite(Number(product.stock))
      ? Number(product.stock)
      : product.inStock ? 1 : 0;
    if (availableStock < quantity) {
      throw createStockError(`Insufficient stock for ${product.name}. Available: ${availableStock}`);
    }
    products.set(productId, product);
  }
  return { products, requirements };
};

const decrementOrderStock = async (items) => {
  const { requirements } = await validateOrderStock(items);
  for (const [productId, quantity] of requirements) {
    if (mongoose.connection.readyState === 1) {
      let updatedProduct = null;
      try {
        updatedProduct = await Product.findOneAndUpdate(
          { _id: productId, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true },
        );
      } catch (error) {
        if (error.name !== "CastError") throw error;
      }
      if (updatedProduct) {
        await Product.findByIdAndUpdate(productId, { inStock: updatedProduct.stock > 0 });
        continue;
      }
    }

    const fallbackProduct = decrementProductStockFallback(productId, quantity);
    if (fallbackProduct === undefined) {
      throw createStockError(`Insufficient stock for product ${productId}`);
    }
    if (!fallbackProduct) throw createStockError(`Product ${productId} not found`);
  }
};

const prepareOrderReceipt = async (order) => {
  const receiptOrder = typeof order?.toObject === "function" ? order.toObject() : { ...order };
  if (receiptOrder.address && typeof receiptOrder.address !== "object") {
    try {
      receiptOrder.address = await Address.findById(receiptOrder.address);
    } catch {
      receiptOrder.address = null;
    }
  }

  receiptOrder.items = await Promise.all((receiptOrder.items || []).map(async (item) => {
    let product = item.product && typeof item.product === "object" ? item.product : null;
    if (!product || !product.name) {
      try {
        product = await Product.findById(item.product);
      } catch {
        product = null;
      }
      if (!product) product = await findProductByIdFallback(item.product);
    }
    const quantity = Number(item.quantity || item.qty || 1);
    const unitPrice = Number(product?.offerPrice || product?.price || item.unitPrice || item.price || 0);
    return { ...item, product: product?.toObject ? product.toObject() : product, quantity, unitPrice, subtotal: unitPrice * quantity };
  }));
  return receiptOrder;
};

// POST /api/order/cod
export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.user;
    const { items, address } = req.body;
    const addressId = typeof address === "string" ? address : address?._id || address?.id;

    console.info("placeOrderCOD request:", { userId, items, addressId });

    if (!addressId || !items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ success: false, message: "Items and address are required" });

    const { products } = await validateOrderStock(items);
    let amount = 0;
    for (const item of items) {
      const quantity = Number(item.quantity);
      const product = products.get(String(item.product?._id || item.product));
      amount += Number(product.offerPrice || product.price || 0) * quantity;
    }
    amount = Math.floor(amount + SHIPPING_CHARGE);

    await decrementOrderStock(items);
    const order = await Order.create({ userId, items, address: addressId, amount, paymentType: "COD", isPaid: false, isStockDeducted: true });

    // Clear user cart
    await User.findByIdAndUpdate(userId, { cartItems: {} });

    const user = await User.findById(userId);
    const receiptOrder = await prepareOrderReceipt(order);
    sendEmail({ to: user.email, ...orderConfirmationEmail(user.name, receiptOrder) }).catch(console.error);

    res.status(201).json({ success: true, message: "Order placed successfully", orderId: order._id });
  } catch (error) {
    console.error("placeOrderCOD error:", error);
    res.status(error.status || 500).json({ success: false, message: error.status ? error.message : "Failed to place order", error: error.message });
  }
};

// POST /api/order/stripe
export const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.user;
    const { items, address } = req.body;

    if (!address || !items || items.length === 0)
      return res.status(400).json({ success: false, message: "Items and address are required" });

    const { products } = await validateOrderStock(items);
    let amount = 0;
    const lineItems = [];
    for (const item of items) {
      const product = products.get(String(item.product?._id || item.product));
      const unitPrice = Number(product.offerPrice || product.price || 0);
      amount += unitPrice * item.quantity;
      lineItems.push({
        price_data: {
          currency: "pkr",
          product_data: { name: product.name },
          unit_amount: Math.round(unitPrice * 100),
        },
        quantity: item.quantity,
      });
    }
    amount = Math.floor(amount + SHIPPING_CHARGE);
    lineItems.push({
      price_data: {
        currency: "pkr",
        product_data: { name: "Shipping" },
        unit_amount: SHIPPING_CHARGE * 100,
      },
      quantity: 1,
    });

    // Create pending order first
    const order = await Order.create({ userId, items, address, amount, paymentType: "Online", isPaid: false, isStockDeducted: false });

    const frontendBaseUrl = String(process.env.FRONTEND_URL || "http://127.0.0.1:5173").replace(/^"|"$/g, "").replace(/\/$/, "");
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${frontendBaseUrl}/my-orders?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendBaseUrl}/cart?payment=cancelled`,
      metadata: { orderId: order._id.toString(), userId },
    });

    res.status(200).json({ success: true, sessionUrl: session.url, orderId: order._id });
  } catch (error) {
    console.error("placeOrderStripe error:", error);
    res.status(error.status || 500).json({ success: false, message: error.status ? error.message : "Failed to create payment session", error: error.message });
  }
};

// POST /api/order/stripe/verify
export const verifyStripePayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      let order = await Order.findById(session.metadata.orderId);
      if (!order) return res.status(404).json({ success: false, message: "Order not found" });
      if (!order.isStockDeducted) {
        await decrementOrderStock(order.items);
        order = await Order.findByIdAndUpdate(
          session.metadata.orderId,
          { isPaid: true, status: "Order Placed", isStockDeducted: true },
          { new: true },
        );
      } else {
        order = await Order.findByIdAndUpdate(
          session.metadata.orderId,
          { isPaid: true, status: "Order Placed" },
          { new: true },
        );
      }
      await User.findByIdAndUpdate(session.metadata.userId, { cartItems: {} });

      const user = await User.findById(session.metadata.userId);
      const receiptOrder = await prepareOrderReceipt(order);
      sendEmail({ to: user.email, ...orderConfirmationEmail(user.name, receiptOrder) }).catch(console.error);

      return res.status(200).json({ success: true, message: "Payment verified" });
    }
    res.status(400).json({ success: false, message: "Payment not completed" });
  } catch (error) {
    console.error("verifyStripePayment error:", error);
    res.status(error.status || 500).json({ success: false, message: error.status ? error.message : "Payment verification failed", error: error.message });
  }
};

// GET /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user;
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    // Populate items' product objects and address when fallback mode left them as IDs
    for (const order of orders) {
      // address
      try {
        if (order.address && typeof order.address === "string") {
          const a = await Address.findById(order.address);
          if (a) order.address = a;
        }
      } catch (e) {
        // ignore
      }

      // items products
      for (const item of order.items) {
        try {
          if (!item.product || typeof item.product === "string" || !item.product.name) {
            const p = await Product.findById(item.product);
            if (p) item.product = p;
            else {
              const pf = await findProductByIdFallback(item.product);
              if (pf) item.product = pf;
            }
          }
        } catch (e) {
          // ignore
        }
      }
    }
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("getUserOrders error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message });
  }
};

// GET /api/order/seller
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("getAllOrders error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message });
  }
};

// PUT /api/order/status  (seller only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const allowed = ["Order Placed", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status value" });

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    res.status(500).json({ success: false, message: "Failed to update status", error: error.message });
  }
};

// PUT /api/order/cancel/:id  (user only)
export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, userId });

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (["Shipped", "Delivered"].includes(order.status))
      return res.status(400).json({ success: false, message: "Cannot cancel order after it has been shipped" });

    order.status = "Cancelled";
    await order.save();
    res.status(200).json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    console.error("cancelOrder error:", error);
    res.status(500).json({ success: false, message: "Failed to cancel order", error: error.message });
  }
};

// GET /api/order/analytics  (seller only)
export const getAnalytics = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
      status: { $ne: "Cancelled" },
    }).populate("items.product");

    const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
    const totalOrders = orders.length;
    const totalItemsSold = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

    // Revenue by month (last 6 months)
    const now = new Date();
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
      const revenue = orders
        .filter((o) => {
          const od = new Date(o.createdAt);
          return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth();
        })
        .reduce((sum, o) => sum + o.amount, 0);
      monthly.push({ label, revenue });
    }

    // Top products
    const productMap = {};
    for (const o of orders) {
      for (const i of o.items) {
        if (!i.product) continue;
        const pid = i.product._id.toString();
        if (!productMap[pid]) productMap[pid] = { name: i.product.name, sold: 0, revenue: 0 };
        productMap[pid].sold += i.quantity;
        productMap[pid].revenue += i.quantity * i.product.offerPrice;
      }
    }
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.status(200).json({ success: true, totalRevenue, totalOrders, totalItemsSold, monthly, topProducts });
  } catch (error) {
    console.error("getAnalytics error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch analytics", error: error.message });
  }
};

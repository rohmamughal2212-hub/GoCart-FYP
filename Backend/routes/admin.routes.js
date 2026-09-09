import express from "express";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";
import { findProductByIdFallback } from "../config/fallbackDb.js";
import { dbAvailable } from "../config/connectDB.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const isMongoReady = () => dbAvailable && mongoose.connection.readyState === 1;

// Load fallback DB
let fallbackDb = { users: [], products: [], orders: [], addresses: [] };
const __filename = fileURLToPath(import.meta.url);
const FALLBACK_DB_PATH = path.join(path.dirname(__filename), "..", "data", "fallbackDb.json");

const loadFallbackDb = () => {
  try {
    if (fs.existsSync(FALLBACK_DB_PATH)) {
      const raw = fs.readFileSync(FALLBACK_DB_PATH, "utf8");
      const parsed = JSON.parse(raw);
      fallbackDb = {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        products: Array.isArray(parsed.products) ? parsed.products : [],
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        addresses: Array.isArray(parsed.addresses) ? parsed.addresses : [],
      };
    }
  } catch (error) {
    console.warn("Could not load fallback DB:", error.message);
  }
};

const writeFallbackDbFile = (obj) => {
  try {
    const dir = path.dirname(FALLBACK_DB_PATH);
    const tmp = path.join(dir, `${path.basename(FALLBACK_DB_PATH)}.tmp`);
    fs.writeFileSync(tmp, JSON.stringify(obj, null, 2), "utf8");
    fs.renameSync(tmp, FALLBACK_DB_PATH);
    return true;
  } catch (err) {
    console.warn("Could not write fallback DB atomically:", err.message);
    try {
      fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(obj, null, 2), "utf8");
      return true;
    } catch (e) {
      console.warn("Fallback write also failed:", e.message);
      return false;
    }
  }
};

const getPakistanDateKey = (value) => {
  const date = new Date(value);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
};

const formatPakistanLabel = (date) => {
  const d = new Date(date);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${formatter.format(d)} PKT`;
};

const formatPakistanMonth = (date) => {
  const d = new Date(date);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Karachi",
    month: "long",
    year: "numeric",
  });
  return formatter.format(d);
};

loadFallbackDb();

// Get total users count
router.get("/stats/users", async (req, res) => {
  try {
    const totalUsers = fallbackDb.users.length;
    res.json({ success: true, totalUsers });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get total orders count (excluding cancelled)
router.get("/stats/orders", async (req, res) => {
  try {
    const totalOrders = fallbackDb.orders.filter(o => {
      const s = String(o.status || "").toLowerCase();
      return s !== "cancelled" && s !== "cancel";
    }).length;
    res.json({ success: true, totalOrders });
  } catch (error) {
    console.error("Error fetching orders stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get total revenue from successful orders
router.get("/stats/revenue", async (req, res) => {
  try {
    const totalRevenue = fallbackDb.orders
      .filter(o => {
        const s = String(o.status || "").toLowerCase();
        // include pending, confirmed, delivered, completed but exclude cancelled
        return s !== "cancelled" && s !== "cancel";
      })
      .reduce((sum, o) => sum + (o.amount || 0), 0);
    res.json({ success: true, totalRevenue });
  } catch (error) {
    console.error("Error fetching revenue stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get total products count
router.get("/stats/products", async (req, res) => {
  try {
    const totalProducts = fallbackDb.products.length;
    res.json({ success: true, totalProducts });
  } catch (error) {
    console.error("Error fetching products stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all stats at once
router.get("/stats", async (req, res) => {
  try {
    let totalUsers, totalOrders, totalProducts, totalRevenue = 0;
    let todayOrders = 0;
    let todayRevenue = 0;
    let yesterdayOrders = 0;
    let yesterdayRevenue = 0;
    let monthOrders = 0;
    let monthRevenue = 0;
    let pendingToday = 0, pendingYesterday = 0, pendingMonth = 0;
    let confirmedToday = 0, confirmedYesterday = 0, confirmedMonth = 0;
    let deliveredToday = 0, deliveredYesterday = 0, deliveredMonth = 0;

    loadFallbackDb();

    const now = new Date();
    const todayKey = getPakistanDateKey(now);
    const yesterdayKey = getPakistanDateKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));
    const monthLabel = formatPakistanMonth(now);
    const todayLabel = formatPakistanLabel(now);

    const orders = isMongoReady() ? await Order.find({}).lean() : fallbackDb.orders;
    const validOrders = orders.filter((o) => {
      const s = String(o.status || "").toLowerCase();
      return s !== "cancelled" && s !== "cancel";
    });

    totalUsers = isMongoReady() ? await User.countDocuments({}) : fallbackDb.users.length;
    const mongoProductCount = isMongoReady() ? await Product.countDocuments({}) : 0;
    totalProducts = mongoProductCount || fallbackDb.products.length;
    totalOrders = validOrders.length;
    totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.amount || o.total || 0), 0);

    validOrders.forEach((order) => {
      const createdAt = order.createdAt || order.updatedAt || order.date || new Date().toISOString();
      const orderKey = getPakistanDateKey(createdAt);
      const isCurrentMonth = formatPakistanMonth(createdAt) === monthLabel;
      const status = String(order.status || "pending").toLowerCase();
      const isPending = status === "pending" || status === "order placed";
      const isConfirmed = status === "confirmed" || status === "processing" || status === "shipped";
      const isDelivered = status === "delivered" || status === "completed";
      const amount = Number(order.amount || order.total || 0);

      if (orderKey === todayKey) {
        todayOrders += 1;
        todayRevenue += amount;
        if (isPending) pendingToday += 1;
        if (isConfirmed) confirmedToday += 1;
        if (isDelivered) deliveredToday += 1;
      }
      if (orderKey === yesterdayKey) {
        yesterdayOrders += 1;
        yesterdayRevenue += amount;
        if (isPending) pendingYesterday += 1;
        if (isConfirmed) confirmedYesterday += 1;
        if (isDelivered) deliveredYesterday += 1;
      }
      if (isCurrentMonth) {
        monthOrders += 1;
        monthRevenue += amount;
        if (isPending) pendingMonth += 1;
        if (isConfirmed) confirmedMonth += 1;
        if (isDelivered) deliveredMonth += 1;
      }
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue,
        todayOrders,
        todayRevenue,
        todayLabel,
        yesterdayOrders,
        yesterdayRevenue,
        monthOrders,
        monthRevenue,
        monthLabel,
        pendingToday,
        pendingYesterday,
        pendingMonth,
        confirmedToday,
        confirmedYesterday,
        confirmedMonth,
        deliveredToday,
        deliveredYesterday,
        deliveredMonth,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get list of users (fallback or DB)
router.get("/users", async (req, res) => {
  try {
    if (isMongoReady()) {
      const users = await User.find({}, "name email address phone").lean();
      return res.json({ success: true, users });
    }

    // Fallback
    loadFallbackDb();
    const users = fallbackDb.users.map((u) => ({
      _id: u._id || u.id || null,
      name: u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim(),
      email: u.email || "",
      address: u.address || "",
      phone: u.phone || u.mobile || "",
    }));
    return res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a user by id (fallback or DB)
router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (isMongoReady()) {
      await User.findByIdAndDelete(id);
      return res.json({ success: true });
    }

    // Fallback: remove user from fallbackDb and write file
    loadFallbackDb();
    const beforeCount = fallbackDb.users.length;
    fallbackDb.users = fallbackDb.users.filter((u) => (u._id || u.id || String(u._id)) !== id && String(u.id) !== id);
    const afterCount = fallbackDb.users.length;
    try { writeFallbackDbFile(fallbackDb); } catch (err) { console.warn("Could not write fallback DB:", err.message); }
    if (afterCount < beforeCount) return res.json({ success: true });
    return res.status(404).json({ success: false, message: "User not found" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all orders (fallback or DB)
router.get("/orders", async (req, res) => {
  try {
    if (isMongoReady()) {
      const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
      const users = await User.find({}, "name email phone").lean();
      const addresses = await Address.find({}).lean();
      const products = await Product.find({}).lean();
      const userById = new Map(users.map((user) => [String(user._id), user]));
      const addressById = new Map(addresses.map((address) => [String(address._id), address]));
      const productById = new Map(products.map((product) => [String(product._id), product]));

      const normalizedOrders = await Promise.all(orders.map(async (order) => {
        const user = userById.get(String(order.userId));
        const address = typeof order.address === "object"
          ? order.address
          : addressById.get(String(order.address));
        const items = await Promise.all((Array.isArray(order.items) ? order.items : (order.cart || [])).map(async (item) => {
          const productId = typeof item.product === "object" ? item.product?._id || item.product?.id : item.product;
          let product = typeof item.product === "object" && item.product?.name ? item.product : productById.get(String(productId));
          if (!product && productId) product = await findProductByIdFallback(productId);
          const quantity = Number(item.quantity || item.qty || 1);
          const unitPrice = Number(item.unitPrice || item.price || product?.offerPrice || product?.price || 0);
          return { ...item, product: product || item.product, quantity, unitPrice, subtotal: unitPrice * quantity };
        }));
        return {
          ...order,
          user: user || null,
          address: address || null,
          userName: user?.name || order.userName || order.customerName || "",
          contact: user?.phone || order.contact || order.phone || address?.phone || "",
          total: order.amount || order.total || 0,
          items,
        };
      }));

      return res.json({ success: true, orders: normalizedOrders });
    }

    loadFallbackDb();
    const orders = fallbackDb.orders.map((o) => {
      // try to resolve user from users table
      const userObj = fallbackDb.users.find(u => String(u._id) === String(o.userId) || String(u.id) === String(o.userId));
      const address = typeof o.address === "object"
        ? o.address
        : fallbackDb.addresses?.find((a) => String(a._id || a.id) === String(o.address));
      const items = (Array.isArray(o.items) ? o.items : (o.cart || [])).map((item) => {
        const productId = typeof item.product === "object" ? item.product._id || item.product.id : item.product;
        const product = typeof item.product === "object"
          ? (item.product.name ? item.product : fallbackDb.products.find((p) => String(p._id || p.id) === String(productId)) || item.product)
          : fallbackDb.products.find((p) => String(p._id || p.id) === String(productId)) || item.product;
        const quantity = Number(item.quantity || item.qty || 1);
        const unitPrice = Number(item.unitPrice || item.price || product?.offerPrice || product?.price || 0);
        return { ...item, product, quantity, unitPrice, subtotal: unitPrice * quantity };
      });
      const addrName = address ? `${address.firstName || ""} ${address.lastName || ""}`.trim() : "";
      const userName = o.userName || o.customerName || (userObj && (userObj.name || `${userObj.firstName || ""} ${userObj.lastName || ""}`.trim())) || addrName || "";
      const contact = o.contact || o.phone || (userObj && (userObj.phone || userObj.mobile || "")) || (address && (address.phone || address.mobile)) || "";
      return {
        _id: o._id || o.id || null,
        user: userObj || null,
        address: address || null,
        userName,
        contact,
        items,
        total: o.amount || o.total || 0,
        amount: o.amount || o.total || 0,
        createdAt: o.createdAt || o.date || null,
        paymentType: o.paymentType || "COD",
        isPaid: Boolean(o.isPaid),
        status: o.status || "pending",
      };
    });
    return res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update order status (fallback or DB)
router.put("/orders/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowedStatuses = ["pending", "confirmed", "delivered"];
  if (!allowedStatuses.includes(String(status).toLowerCase())) {
    return res.status(400).json({ success: false, message: "Invalid order status" });
  }
  const normalizedStatus = String(status).toLowerCase();
  try {
    if (isMongoReady()) {
      const updated = await Order.findByIdAndUpdate(id, { status: normalizedStatus }, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: "Order not found" });
      return res.json({ success: true });
    }

    loadFallbackDb();
    let found = false;
    fallbackDb.orders = fallbackDb.orders.map((o) => {
      const oid = o._id || o.id || String(o._id);
      if (String(oid) === String(id)) {
        found = true;
        return { ...o, status: normalizedStatus };
      }
      return o;
    });
    try { writeFallbackDbFile(fallbackDb); } catch (err) { console.warn(err.message); }
    if (found) return res.json({ success: true });
    return res.status(404).json({ success: false, message: "Order not found" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete an order (fallback or DB)
router.delete("/orders/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (isMongoReady()) {
      await Order.findByIdAndDelete(id);
      return res.json({ success: true });
    }

    loadFallbackDb();
    const before = fallbackDb.orders.length;
    fallbackDb.orders = fallbackDb.orders.filter((o) => (o._id || o.id || String(o._id)) !== id && String(o.id) !== id);
    try { writeFallbackDbFile(fallbackDb); } catch (err) { console.warn(err.message); }
    if (fallbackDb.orders.length < before) return res.json({ success: true });
    return res.status(404).json({ success: false, message: "Order not found" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a product manually from admin (fallback or DB)
const updateFallbackProduct = (id, updateFields) => {
  loadFallbackDb();
  let updated = false;
  fallbackDb.products = fallbackDb.products.map((p) => {
    const pid = p._id || p.id || String(p._id);
    if (String(pid) !== String(id)) return p;
    updated = true;
    return {
      ...p,
      ...updateFields,
      updatedAt: new Date().toISOString(),
    };
  });

  if (!updated) {
    const catalogProduct = findProductByIdFallback(id);
    if (catalogProduct) {
      fallbackDb.products.push({
        ...catalogProduct,
        ...updateFields,
        updatedAt: new Date().toISOString(),
      });
      updated = true;
    }
  }

  if (!updated) return null;
  if (!writeFallbackDbFile(fallbackDb)) return null;
  return fallbackDb.products.find((p) => String(p._id || p.id) === String(id)) || null;
};

router.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, offerPrice, stock } = req.body;
  const updateFields = {};

  if (price !== undefined) updateFields.price = Number(price);
  if (offerPrice !== undefined) updateFields.offerPrice = Number(offerPrice);
  if (stock !== undefined) {
    const stockNum = Number(stock);
    updateFields.stock = Number.isNaN(stockNum) ? 0 : Math.max(0, Math.floor(stockNum));
    updateFields.inStock = updateFields.stock > 0;
  }

  try {
    if (isMongoReady()) {
      let updated = null;
      try {
        updated = await Product.findByIdAndUpdate(id, updateFields, { new: true });
      } catch (error) {
        if (error.name !== "CastError") throw error;
      }
      if (updated) return res.json({ success: true, product: updated });

      if (name) {
        updated = await Product.findOneAndUpdate({ name }, updateFields, { new: true });
        if (updated) return res.json({ success: true, product: updated });
      }

      const fallbackProduct = updateFallbackProduct(id, updateFields);
      if (!fallbackProduct) return res.status(404).json({ success: false, message: "Product not found" });
      return res.json({ success: true, product: fallbackProduct });
    }

    const product = updateFallbackProduct(id, updateFields);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    return res.json({ success: true, product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a product (fallback or DB)
router.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (isMongoReady()) {
      await Product.findByIdAndDelete(id);
      loadFallbackDb();
      const before = fallbackDb.products.length;
      fallbackDb.products = fallbackDb.products.filter((p) => String(p._id || p.id || "") !== String(id));
      if (fallbackDb.products.length < before) writeFallbackDbFile(fallbackDb);
      return res.json({ success: true });
    }

    loadFallbackDb();
    const before = fallbackDb.products.length;
    fallbackDb.products = fallbackDb.products.filter((p) => (String(p._id || p.id || p._id) !== String(id) && String(p.id) !== String(id)));
    try { writeFallbackDbFile(fallbackDb); } catch (err) { console.warn("Could not write fallback DB:", err.message); }
    if (fallbackDb.products.length < before) return res.json({ success: true });
    return res.status(404).json({ success: false, message: "Product not found" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

// Admin: add a product to the fallback DB (accepts multipart images)
import { upload } from "../config/multer.js";
import crypto from "crypto";

router.post(
  "/products/add-fallback",
  upload.array("image", 4),
  async (req, res) => {
    try {
      const { name, description, category, price, offerPrice, stock } = req.body;
      if (!name || !description || !category) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      loadFallbackDb();

      const images = [];
      if (req.files && req.files.length) {
        for (const f of req.files) {
          const mime = f.mimetype || "image/png";
          const b64 = f.buffer.toString("base64");
          images.push(`data:${mime};base64,${b64}`);
        }
      }

      const generateStableId = (value) =>
        crypto.createHash("md5").update(String(value)).digest("hex").slice(0, 24);

      const pid = generateStableId(`${category}|${name}|${price}|${offerPrice}|${Date.now()}`);
      const newProduct = {
        _id: pid,
        name,
        description: Array.isArray(description) ? description : String(description).split("\n"),
        category,
        price: Number(price) || 0,
        offerPrice: Number(offerPrice) || Number(price) || 0,
        stock: Number(stock) || 0,
        inStock: Number(stock) > 0,
        image: images,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      fallbackDb.products = fallbackDb.products || [];
      fallbackDb.products.push(newProduct);
      const ok = writeFallbackDbFile(fallbackDb);
      if (!ok) return res.status(500).json({ success: false, message: "Failed to persist product" });
      return res.status(201).json({ success: true, product: newProduct, message: "Product added to fallback DB" });
    } catch (err) {
      console.error("add-fallback error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },
);

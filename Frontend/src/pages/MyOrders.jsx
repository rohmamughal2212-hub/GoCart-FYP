import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { assets, dummyProducts, electronicsProducts } from "../assets/assets";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  "Order Placed": "bg-blue-100 text-blue-700",
  Processing:     "bg-yellow-100 text-yellow-700",
  Shipped:        "bg-purple-100 text-purple-700",
  Delivered:      "bg-green-100 text-green-700",
  Cancelled:      "bg-red-100 text-red-600",
};

const MyOrders = () => {
  const [myOrders, setMyOrders]     = useState([]);
  const [verifying, setVerifying]   = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const { axios, user, setCartItems, navigate } = useAppContext();
  const location = useLocation();

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data } = await axios.get("/api/order/user");
      if (data.success) setMyOrders(data.orders);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  /* ── Stripe payment verification on redirect back ── */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get("session_id");
    const payment   = params.get("payment");

    if (payment === "success" && sessionId) {
      setVerifying(true);
      axios
        .post("/api/order/stripe/verify", { sessionId })
        .then(({ data }) => {
          if (data.success) {
            toast.success("Payment confirmed! Your order is placed.");
            setCartItems({});           // clear frontend cart state
          } else {
            toast.error(data.message || "Payment verification failed");
          }
        })
        .catch(() => toast.error("Could not verify payment. Contact support."))
        .finally(() => {
          setVerifying(false);
          // Remove query params from URL without re-mounting the page
          window.history.replaceState({}, "", "/my-orders");
          fetchOrders();
        });
    } else if (payment === "cancelled") {
      toast.error("Payment was cancelled. Your order has not been placed.");
      window.history.replaceState({}, "", "/my-orders");
    }
  }, []);

  /* ── Load orders on mount / when user is available ── */
  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const cancelOrder = async (orderId) => {
    if (!confirm("Cancel this order?")) return;
    try {
      const { data } = await axios.put(`/api/order/cancel/${orderId}`);
      if (data.success) { toast.success(data.message); fetchOrders(); }
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500">Verifying your payment…</p>
      </div>
    );
  }

  if (ordersLoading) {
    return (
      <div className="mt-12 pb-16">
        <p className="text-2xl md:text-3xl font-medium mb-8">My Orders</p>
        <div className="space-y-4 max-w-4xl">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="flex gap-4 pb-3 mb-3 border-b border-gray-100">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex-1 h-4 bg-gray-100 rounded" />
                ))}
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (myOrders.length === 0) {
    return (
      <div className="mt-12 pb-16 text-center">
        <p className="text-2xl text-gray-400 mb-4">No orders yet</p>
        <button
          onClick={() => navigate("/products")}
          className="px-8 py-3 bg-indigo-500 text-white rounded hover:bg-indigo-600 cursor-pointer"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="mt-12 pb-16">
      <p className="text-2xl md:text-3xl font-medium mb-8">My Orders</p>

      {myOrders.map((order) => (
        <div key={order._id} className="border border-gray-300 rounded-lg mb-6 p-4 max-w-4xl">
          {/* Order Header */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4 pb-3 border-b border-gray-200">
            <div>
              <p className="text-xs text-gray-400">Order ID</p>
              <p className="text-sm font-medium">{order._id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Date</p>
              <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Payment</p>
              <p className="text-sm">
                {order.paymentType}{" "}
                {order.isPaid
                  ? <span className="text-green-600 font-medium">✓ Paid</span>
                  : order.paymentType === "COD"
                    ? <span className="text-gray-400">(on delivery)</span>
                    : <span className="text-yellow-600">Pending</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-sm font-semibold">Rs. {order.amount}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
              {order.status}
            </span>
            {!["Shipped", "Delivered", "Cancelled"].includes(order.status) && (
              <button
                onClick={() => cancelOrder(order._id)}
                className="text-xs text-red-500 border border-red-300 px-3 py-1 rounded hover:bg-red-50 cursor-pointer"
              >
                Cancel Order
              </button>
            )}
          </div>

          {/* Order Items */}
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
              <img
                src={(() => {
                  try {
                    let first = item.product?.image && item.product.image[0];
                    if (!first) {
                      const bundled = [...dummyProducts, ...electronicsProducts].find((p) => p._id === item.product?._id);
                      first = bundled?.image && bundled.image[0];
                    }
                    if (!first) return assets.profile_icon;
                    if (typeof first === 'string') return first.trim() || assets.profile_icon;
                    if (typeof first === 'object') return (first.url || first.secure_url || first.path || first.src) || assets.profile_icon;
                    return assets.profile_icon;
                  } catch (e) { return assets.profile_icon; }
                })()}
                alt={item.product?.name}
                className="w-16 h-16 object-cover border border-gray-200 rounded"
              />
              <div className="flex-1">
                <p className="font-medium">{item.product?.name}</p>
                <p className="text-sm text-gray-500">{item.product?.category}</p>
              </div>
              <div className="text-sm text-right">
                <p>Qty: {item.quantity}</p>
                <p className="font-medium">Rs. {(item.product?.offerPrice * item.quantity).toFixed(0)}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MyOrders;

import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import AdminProfileModal from "../components/AdminProfileModal";
import { categories } from "../assets/assets";
import toast from "react-hot-toast";

const Icon = ({ name, size = 20, strokeWidth = 1.8 }) => {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    package: <><path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" /></>,
    wallet: <><path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v10a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6" /><path d="M16 14h.01" /></>,
    bag: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18M16 10a4 4 0 0 1-8 0" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <><path d="M20 6 9 17l-5-5" /></>,
    truck: <><path d="M10 17h4V5H2v12h3M14 9h4l4 4v4h-2M5 17a2 2 0 1 0 4 0M16 17a2 2 0 1 0 4 0" /></>,
    alert: <><path d="M10.3 3.3 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
    x: <><path d="M18 6 6 18M6 6l12 12" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    printer: <><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v8H6z" /></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

const getReceiptAddress = (order) => order.address || {};
const getReceiptCustomerName = (order) => {
  const address = getReceiptAddress(order);
  return order.user?.name || order.userName || `${address.firstName || ""} ${address.lastName || ""}`.trim() || "Customer";
};
const getReceiptItems = (order) => Array.isArray(order.items) ? order.items : [];
const getReceiptLine = (item) => {
  const product = item.product && typeof item.product === "object" ? item.product : {};
  const name = product.name || product.title || item.name || item.title || item.productName || "Product";
  const quantity = Number(item.quantity || item.qty || 1);
  const unitPrice = Number(item.unitPrice || item.price || product.offerPrice || product.price || 0);
  return { name, quantity, unitPrice, subtotal: Number(item.subtotal ?? unitPrice * quantity) };
};
const escapeReceiptHtml = (value) => String(value ?? "-")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const buildReceiptHtml = (order, receiptType) => {
  const address = getReceiptAddress(order);
  const customerName = getReceiptCustomerName(order);
  const isAdminReceipt = receiptType === "admin";
  const addressText = [address.street, address.city, address.state, address.zipCode, address.country].filter(Boolean).join(", ");
  const itemRows = getReceiptItems(order).map((item) => {
    const { name, quantity, unitPrice, subtotal } = getReceiptLine(item);
    return `<tr><td>${escapeReceiptHtml(name)}</td><td>${quantity}</td><td>PKR ${unitPrice.toLocaleString()}</td><td>PKR ${subtotal.toLocaleString()}</td></tr>`;
  }).join("");

  return `<!doctype html><html><head><title>${isAdminReceipt ? "Admin" : "Customer"} Receipt</title><style>
    body{font-family:Arial,sans-serif;color:#172033;margin:0;padding:32px;background:#f5f7fb}main{max-width:760px;margin:auto;background:#fff;padding:36px;border:1px solid #dbe2ee}header{display:flex;justify-content:space-between;border-bottom:2px solid #172033;padding-bottom:18px;margin-bottom:24px}h1{margin:0;font-size:25px}h2{font-size:17px;margin:24px 0 10px}.muted{color:#667085;font-size:13px;line-height:1.6}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}table{width:100%;border-collapse:collapse;margin-top:10px}th,td{text-align:left;padding:10px 6px;border-bottom:1px solid #e5e7eb;font-size:13px}th{color:#667085}.total{text-align:right;font-size:18px;font-weight:700;margin-top:18px}.meta{background:#f5f7fb;padding:12px;font-size:13px;line-height:1.8}@media print{body{background:#fff;padding:0}main{border:0;padding:0}}
  </style></head><body><main><header><div><h1>GoCart</h1><p class="muted">${isAdminReceipt ? "Admin Receipt" : "Customer Receipt"}</p></div><div class="muted">Order #${escapeReceiptHtml(order._id)}<br>${order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</div></header><div class="grid"><section><h2>Customer</h2><div class="muted"><strong>${escapeReceiptHtml(customerName)}</strong><br>${escapeReceiptHtml(address.email || order.user?.email || "-")}<br>${escapeReceiptHtml(address.phone || order.contact || order.user?.phone || "-")}<br>${escapeReceiptHtml(addressText || "Address not available")}</div></section><section><h2>Order Details</h2><div class="meta">Status: ${escapeReceiptHtml(order.status || "Order Placed")}<br>Payment: ${escapeReceiptHtml(order.paymentType || "COD")}<br>Paid: ${order.isPaid ? "Yes" : "No"}${isAdminReceipt ? `<br>Customer ID: ${escapeReceiptHtml(order.userId)}` : ""}</div></section></div><h2>Ordered Products</h2><table><thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead><tbody>${itemRows || "<tr><td colspan=\"4\">No product details available</td></tr>"}</tbody></table><p class="total">Total: PKR ${Number(order.total || order.amount || 0).toLocaleString()}</p></main></body></html>`;
};

const ReceiptModal = ({ order, receiptType, setReceiptType, onClose, onPrint, onDownload }) => {
  const address = getReceiptAddress(order);
  const customerName = getReceiptCustomerName(order);
  const addressText = [address.street, address.city, address.state, address.zipCode, address.country].filter(Boolean).join(", ");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4">
          <div><p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Receipt preview</p><h3 className="text-xl font-bold text-slate-900">{receiptType === "admin" ? "Admin Receipt" : "Customer Receipt"}</h3></div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setReceiptType("customer")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${receiptType === "customer" ? "bg-[#101b2d] text-white" : "bg-slate-100 text-slate-600"}`}>Customer</button>
            <button onClick={() => setReceiptType("admin")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${receiptType === "admin" ? "bg-[#101b2d] text-white" : "bg-slate-100 text-slate-600"}`}>Admin</button>
            <button onClick={() => onPrint(order, receiptType)} className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Icon name="printer" size={16} /> Print</button>
            <button onClick={() => onDownload(order, receiptType)} className="flex items-center gap-2 rounded-lg bg-[#2d72d9] px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Icon name="download" size={16} /> Download</button>
            <button onClick={onClose} className="ml-1 rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close receipt"><Icon name="x" size={19} /></button>
          </div>
        </div>
        <div className="p-6 md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-slate-900 pb-5"><div><h1 className="text-2xl font-bold">GoCart</h1><p className="text-sm text-slate-500">{receiptType === "admin" ? "Admin Receipt" : "Customer Receipt"}</p></div><div className="text-right text-sm text-slate-500">Order #{order._id}<br />{order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</div></div>
          <div className="mt-6 grid gap-6 md:grid-cols-2"><div><h4 className="mb-2 font-semibold">Customer</h4><p className="text-sm leading-6 text-slate-600"><strong className="text-slate-900">{customerName}</strong><br />{address.email || order.user?.email || "-"}<br />{address.phone || order.contact || order.user?.phone || "-"}<br />{addressText || "Address not available"}</p></div><div><h4 className="mb-2 font-semibold">Order Details</h4><div className="rounded-xl bg-slate-50 p-3 text-sm leading-7 text-slate-600">Status: <strong>{order.status || "Order Placed"}</strong><br />Payment: <strong>{order.paymentType || "COD"}</strong><br />Paid: <strong>{order.isPaid ? "Yes" : "No"}</strong>{receiptType === "admin" && <><br />Customer ID: <strong>{order.userId || "-"}</strong></>}</div></div></div>
          <h4 className="mb-3 mt-8 font-semibold">Ordered Products</h4><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 text-slate-500"><tr><th className="py-3">Product</th><th className="py-3">Qty</th><th className="py-3">Unit Price</th><th className="py-3 text-right">Subtotal</th></tr></thead><tbody>{getReceiptItems(order).map((item, index) => { const { name, quantity, unitPrice, subtotal } = getReceiptLine(item); return <tr key={index} className="border-b border-slate-100"><td className="py-3 font-medium">{name}</td><td className="py-3">{quantity}</td><td className="py-3">PKR {unitPrice.toLocaleString()}</td><td className="py-3 text-right">PKR {subtotal.toLocaleString()}</td></tr>; })}</tbody></table></div><p className="mt-5 text-right text-lg font-bold">Total: PKR {Number(order.total || order.amount || 0).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { axios, products, fetchProducts } = useAppContext();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState({ name: "Admin", email: "" });
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    todayOrders: 0,
    todayRevenue: 0,
    todayLabel: "",
    yesterdayOrders: 0,
    yesterdayRevenue: 0,
    monthOrders: 0,
    monthRevenue: 0,
    monthLabel: "",
    pendingToday: 0,
    pendingYesterday: 0,
    pendingMonth: 0,
    confirmedToday: 0,
    confirmedYesterday: 0,
    confirmedMonth: 0,
    deliveredToday: 0,
    deliveredYesterday: 0,
    deliveredMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { title: "Manage Users", icon: "users", view: "users" },
    { title: "Manage Orders", icon: "package", view: "orders" },
    { title: "Manage Products", icon: "bag", view: "products" },
    { title: "Receipts", icon: "file", view: "receipts" },
  ];

  const [visibleIndex, setVisibleIndex] = useState(-1);
  useEffect(() => {
    let timer = null;
    setVisibleIndex(-1);
    timer = setInterval(() => {
      setVisibleIndex((prev) => {
        if (prev >= menuItems.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);

  const [activeView, setActiveView] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptType, setReceiptType] = useState("customer");
  const [productCategories, setProductCategories] = useState([]);
  const [productToEdit, setProductToEdit] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [editOfferPrice, setEditOfferPrice] = useState("");
  const [editStock, setEditStock] = useState(0);
  const [savingProduct, setSavingProduct] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    offerPrice: "",
    stock: 10,
    images: [],
  });
  const [imagePreview, setImagePreview] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/stats");

      // Calculate order status counts
      let pendingToday = 0, pendingYesterday = 0, pendingMonth = 0;
      let confirmedToday = 0, confirmedYesterday = 0, confirmedMonth = 0;
      let deliveredToday = 0, deliveredYesterday = 0, deliveredMonth = 0;

      if (orders && orders.length > 0) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        orders.forEach(order => {
          const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
          const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
          const status = (order.status || "pending").toLowerCase();

          const isToday = orderDateOnly.getTime() === today.getTime();
          const isYesterday = orderDateOnly.getTime() === yesterday.getTime();
          const isThisMonth = orderDate >= monthStart;

          if (status === "pending") {
            if (isToday) pendingToday++;
            if (isYesterday) pendingYesterday++;
            if (isThisMonth) pendingMonth++;
          } else if (status === "confirmed") {
            if (isToday) confirmedToday++;
            if (isYesterday) confirmedYesterday++;
            if (isThisMonth) confirmedMonth++;
          } else if (status === "delivered" || status === "completed") {
            if (isToday) deliveredToday++;
            if (isYesterday) deliveredYesterday++;
            if (isThisMonth) deliveredMonth++;
          }
        });
      }

      if (res.data?.success && res.data?.stats) {
        setStats({
          totalUsers: res.data.stats.totalUsers || 0,
          totalOrders: res.data.stats.totalOrders || 0,
          totalRevenue: Math.round(res.data.stats.totalRevenue || 0),
          totalProducts: res.data.stats.totalProducts || 0,
          todayOrders: res.data.stats.todayOrders || 0,
          todayRevenue: Math.round(res.data.stats.todayRevenue || 0),
          todayLabel: res.data.stats.todayLabel || "",
          yesterdayOrders: res.data.stats.yesterdayOrders || 0,
          yesterdayRevenue: Math.round(res.data.stats.yesterdayRevenue || 0),
          monthOrders: res.data.stats.monthOrders || 0,
          monthRevenue: Math.round(res.data.stats.monthRevenue || 0),
          monthLabel: res.data.stats.monthLabel || "",
          pendingToday: res.data.stats.pendingToday ?? pendingToday,
          pendingYesterday: res.data.stats.pendingYesterday ?? pendingYesterday,
          pendingMonth: res.data.stats.pendingMonth ?? pendingMonth,
          confirmedToday: res.data.stats.confirmedToday ?? confirmedToday,
          confirmedYesterday: res.data.stats.confirmedYesterday ?? confirmedYesterday,
          confirmedMonth: res.data.stats.confirmedMonth ?? confirmedMonth,
          deliveredToday: res.data.stats.deliveredToday ?? deliveredToday,
          deliveredYesterday: res.data.stats.deliveredYesterday ?? deliveredYesterday,
          deliveredMonth: res.data.stats.deliveredMonth ?? deliveredMonth,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("/api/admin/users");
      if (data.success) setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    if (activeView === "users") fetchUsers();
    if (activeView === "orders" || activeView === "receipts") fetchOrders();
    if (activeView === "products") fetchProducts();
  }, [activeView]);

  useEffect(() => {
    const groups = products.reduce((acc, product) => {
      const category = product.category || "Uncategorized";
      acc[category] = acc[category] || [];
      acc[category].push(product);
      return acc;
    }, {});
    setProductCategories(Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0])));
  }, [products]);

  // Poll stats while dashboard or orders view active
  useEffect(() => {
    if (activeView !== "dashboard" && activeView !== "orders") return;
    const id = setInterval(() => fetchStats(), 8000);
    return () => clearInterval(id);
  }, [activeView]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/admin/orders");
      if (data?.success) setOrders(data.orders || []);
      else setOrders(data?.orders || []);
      // update stats after loading orders
      fetchStats();
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      toast.error("Failed to load orders");
    }
  };

  const openReceipt = (order, type = "customer") => {
    setSelectedReceipt(order);
    setReceiptType(type);
  };

  const printReceipt = (order, type) => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      toast.error("Please allow pop-ups to print the receipt");
      return;
    }
    printWindow.document.write(buildReceiptHtml(order, type));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const downloadReceipt = (order, type) => {
    const blob = new Blob([buildReceiptHtml(order, type)], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}-receipt-${order._id || "order"}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      const { data } = await axios.put(`/api/admin/orders/${id}/status`, { status });
      if (data?.success) {
        toast.success(`Order marked as ${status}`);
        setOrders((prev) => prev.map((o) => (String(o._id) === String(id) ? { ...o, status } : o)));
        fetchStats();
      } else {
        toast.error(data?.message || "Failed to update order");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.response?.data?.message || "Failed to update order");
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm("Delete this order?")) return;
    try {
      const { data } = await axios.delete(`/api/admin/orders/${id}`);
      if (data?.success) {
        toast.success("Order deleted successfully");
        setOrders((prev) => prev.filter((o) => String(o._id) !== String(id)));
        fetchStats();
      } else {
        toast.error(data?.message || "Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || "Failed to delete order");
    }
  };

  const openProductEditor = (product) => {
    setProductToEdit(product);
    setEditPrice(product.price || "");
    setEditOfferPrice(product.offerPrice || "");
    setEditStock(typeof product.stock === "number" ? product.stock : product.inStock ? 1 : 0);
  };

  const closeProductEditor = () => {
    setProductToEdit(null);
    setEditPrice("");
    setEditOfferPrice("");
    setEditStock(0);
  };

  const handleSaveProductEdits = async () => {
    if (!productToEdit) return;
    setSavingProduct(true);
    try {
      const payload = {
        price: Number(editPrice),
        offerPrice: Number(editOfferPrice),
        stock: Number(editStock),
      };
      const { data } = await axios.put(
        `/api/admin/products/${productToEdit._id || productToEdit.id}`,
        payload,
      );
      if (data?.success) {
        toast.success("Product updated");
        await fetchProducts();
        closeProductEditor();
      } else {
        toast.error(data?.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Product update failed:", error);
      toast.error(error.response?.data?.message || error.message || "Update failed");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const { data } = await axios.delete(`/api/admin/users/${id}`);
      if (data.success) {
        toast.success("User deleted");
        setUsers((u) => u.filter((x) => String(x._id) !== String(id)));
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete failed");
    }
  };

  const handleImageChangeForNew = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewProduct((p) => ({ ...p, images: [file] }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCreateProduct = async (e) => {
    e && e.preventDefault && e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("category", newProduct.category);
      formData.append("price", newProduct.price || 0);
      formData.append("offerPrice", newProduct.offerPrice || 0);
      formData.append("stock", newProduct.stock || 0);
      if (newProduct.images && newProduct.images.length > 0) {
        newProduct.images.forEach((f) => formData.append("image", f));
      }

      const { data } = await axios.post("/api/admin/products/add-fallback", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data?.success) {
        toast.success(data.message || "Product added");
        setShowAddProductModal(false);
        setNewProduct({ name: "", description: "", category: "", price: "", offerPrice: "", stock: 10, images: [] });
        setImagePreview(null);
        await fetchProducts();
      } else {
        toast.error(data?.message || "Failed to add product");
      }
    } catch (err) {
      console.error("Add product failed:", err);
      toast.error(err.response?.data?.message || err.message || "Add failed");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      const { data } = await axios.delete(`/api/admin/products/${id}`);
      if (data?.success) {
        toast.success("Product deleted");
        await fetchProducts();
      } else {
        toast.error(data?.message || "Delete failed");
      }
    } catch (err) {
      console.error("Delete product failed:", err);
      toast.error(err.response?.data?.message || err.message || "Delete failed");
    }
  };

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      navigate("/admin/login");
    } else {
      try {
        const savedAdmin = JSON.parse(localStorage.getItem("adminUser") || "{}");
        if (!savedAdmin.email) {
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
          return;
        }
        const savedProfile = JSON.parse(localStorage.getItem("adminProfile") || "{}");
        const profileName = [savedProfile.firstName, savedProfile.lastName].filter(Boolean).join(" ");
        setAdminUser({
          name: profileName || savedAdmin.name || "Admin",
          email: savedAdmin.email || "",
        });
      } catch {
        setAdminUser({ name: "Admin", email: "" });
      }
      setIsAuthenticated(true);
      fetchStats();
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex min-h-[76px] items-center justify-between gap-4 px-5 py-3 md:px-8">
          <div
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            onMouseEnter={() => setShowProfileDropdown(true)}
            onMouseLeave={() => setShowProfileDropdown(false)}
            className="relative flex cursor-pointer items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7efff] text-sm font-bold text-[#1b3a6b]">
              {adminUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold capitalize text-slate-800">{adminUser.name}</p>
              <p className="text-xs text-slate-500">{adminUser.email}</p>
            </div>

            {showProfileDropdown && (
              <div className="absolute left-0 top-full z-50 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileModal(true);
                    setShowProfileDropdown(false);
                  }}
                  className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Icon name="edit" size={16} /> Edit Profile
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Icon name="logout" size={16} /> Logout
                </button>
              </div>
            )}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Workspace</p>
              <h1 className="text-lg font-bold text-slate-900">Admin overview</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="GoCart"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                e.target.outerHTML = '<span class="text-blue-900 font-bold text-lg">GoCart</span>';
              }}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 p-4 md:flex-row md:p-8">
        <aside className="w-full shrink-0 rounded-2xl bg-[#101b2d] p-4 text-slate-200 shadow-[0_18px_45px_rgba(16,27,45,0.18)] md:sticky md:top-24 md:h-[calc(100vh-9rem)] md:w-64">
          <div className="mb-7 flex items-center gap-3 border-b border-white/10 px-2 pb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f4b740] text-sm font-black text-[#101b2d]">G</div>
            <div>
              <h2 className="text-base font-bold text-white">GoCart Admin</h2>
              <p className="text-xs text-slate-400">Operations center</p>
            </div>
          </div>

          <div className="mb-7 rounded-xl bg-white/[0.06] px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2d72d9] text-sm font-bold text-white">{adminUser.name.charAt(0).toUpperCase()}</div>
              <div>
                <p className="text-sm font-semibold capitalize text-white">{adminUser.name}</p>
                <p className="text-xs text-slate-400">{adminUser.email}</p>
              </div>
            </div>
          </div>

          <nav>
            <button
              className={`group mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${0 <= visibleIndex ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                } ${activeView === "dashboard" ? "bg-white text-white shadow-lg shadow-black/10" : "text-slate-400 hover:bg-white/[0.07] hover:text-white"}`}
              onClick={() => setActiveView("dashboard")}
            >
              <span className={activeView === "dashboard" ? "text-[#1b3a6b]" : ""}><Icon name="grid" size={19} /></span>
              <span className={`text-sm font-semibold ${activeView === "dashboard" ? "text-[#101b2d]" : ""}`}>Dashboard</span>
            </button>

            {menuItems.map((item, idx) => (
              <button
                key={idx}
                className={`mb-2 flex w-full transform items-center gap-3 rounded-xl px-3 py-3 text-left duration-300 ${idx + 1 <= visibleIndex ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  } ${activeView === item.view ? "bg-white text-[#101b2d] shadow-lg shadow-black/10" : "text-slate-400 hover:bg-white/[0.07] hover:text-white"}`}
                onClick={() => setActiveView(item.view)}
              >
                <span className={activeView === item.view ? "text-[#1b3a6b]" : ""}><Icon name={item.icon} size={19} /></span>
                <span className="text-sm font-semibold">{item.title}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 w-full md:flex-1">
          {activeView === "dashboard" && (
            <>
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-[#2d72d9]">Performance snapshot</p>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Good afternoon, {adminUser.name}</h2>
                </div>
                <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 sm:block">Live data</span>
              </div>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Total users</p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? "..." : stats.totalUsers.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl bg-[#e8f0ff] p-3 text-[#2d72d9]"><Icon name="users" size={22} /></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Total orders</p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? "..." : stats.totalOrders.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl bg-[#fff4db] p-3 text-[#c17c00]"><Icon name="package" size={22} /></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Total revenue</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{loading ? "..." : `PKR ${stats.totalRevenue.toLocaleString()}`}</p>
                    </div>
                    <div className="rounded-xl bg-[#e5f8f1] p-3 text-[#0f9f6e]"><Icon name="wallet" size={22} /></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Products</p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? "..." : products.length.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl bg-[#f2ebff] p-3 text-[#7a4cc2]"><Icon name="bag" size={22} /></div>
                  </div>
                </div>
              </div>

              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Today ({stats.todayLabel ? stats.todayLabel.replace(/\s+PKT$/, "") : "PKT"})</p>
                  <p className="mt-3 text-2xl font-bold text-slate-900">{loading ? "..." : stats.todayOrders.toLocaleString()} <span className="text-base font-medium text-slate-500">orders</span></p>
                  <p className="mt-2 text-sm font-semibold text-[#1b3a6b]">{loading ? "..." : `PKR ${stats.todayRevenue.toLocaleString()}`}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Yesterday</p>
                  <p className="mt-3 text-2xl font-bold text-slate-900">{loading ? "..." : stats.yesterdayOrders.toLocaleString()} <span className="text-base font-medium text-slate-500">orders</span></p>
                  <p className="mt-2 text-sm font-semibold text-[#1b3a6b]">{loading ? "..." : `PKR ${stats.yesterdayRevenue.toLocaleString()}`}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">{stats.monthLabel || "Current Month"}</p>
                  <p className="mt-3 text-2xl font-bold text-slate-900">{loading ? "..." : stats.monthOrders.toLocaleString()} <span className="text-base font-medium text-slate-500">orders</span></p>
                  <p className="mt-2 text-sm font-semibold text-[#1b3a6b]">{loading ? "..." : `PKR ${stats.monthRevenue.toLocaleString()}`}</p>
                </div>
              </div>

              {/* Order Status Cards */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Status Breakdown</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Pending Orders */}
                  <div className="rounded-2xl border border-amber-100 border-l-4 border-l-amber-400 bg-amber-50/70 p-6 shadow-sm">
                    <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-amber-800"><Icon name="clock" size={17} /> Pending Orders</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Today</span>
                        <span className="text-xl font-bold text-yellow-600">{loading ? "..." : stats.pendingToday}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Yesterday</span>
                        <span className="text-xl font-bold text-yellow-600">{loading ? "..." : stats.pendingYesterday}</span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-3">
                        <span className="text-gray-600 text-sm font-medium">This Month</span>
                        <span className="text-xl font-bold text-yellow-600">{loading ? "..." : stats.pendingMonth}</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirmed Orders */}
                  <div className="rounded-2xl border border-blue-100 border-l-4 border-l-blue-500 bg-blue-50/70 p-6 shadow-sm">
                    <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-blue-800"><Icon name="check" size={17} /> Confirmed Orders</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Today</span>
                        <span className="text-xl font-bold text-blue-600">{loading ? "..." : stats.confirmedToday}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Yesterday</span>
                        <span className="text-xl font-bold text-blue-600">{loading ? "..." : stats.confirmedYesterday}</span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-3">
                        <span className="text-gray-600 text-sm font-medium">This Month</span>
                        <span className="text-xl font-bold text-blue-600">{loading ? "..." : stats.confirmedMonth}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivered Orders */}
                  <div className="rounded-2xl border border-emerald-100 border-l-4 border-l-emerald-500 bg-emerald-50/70 p-6 shadow-sm">
                    <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-800"><Icon name="truck" size={17} /> Delivered Orders</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Today</span>
                        <span className="text-xl font-bold text-green-600">{loading ? "..." : stats.deliveredToday}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Yesterday</span>
                        <span className="text-xl font-bold text-green-600">{loading ? "..." : stats.deliveredYesterday}</span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-3">
                        <span className="text-gray-600 text-sm font-medium">This Month</span>
                        <span className="text-xl font-bold text-green-600">{loading ? "..." : stats.deliveredMonth}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Low Stock Products */}
              <div className="mt-8">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900"><Icon name="alert" size={20} /> Low Stock Products <span className="text-sm font-medium text-slate-500">(2 or less)</span></h2>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  {products.filter(p => {
                    const stock = typeof p.stock === "number" ? p.stock : (p.inStock ? 1 : 0);
                    return stock <= 2 && stock > 0;
                  }).length === 0 ? (
                    <p className="text-center text-gray-500 py-8">All products have sufficient stock</p>
                  ) : (
                    <div className="space-y-3">
                      {products
                        .filter(p => {
                          const stock = typeof p.stock === "number" ? p.stock : (p.inStock ? 1 : 0);
                          return stock <= 2 && stock > 0;
                        })
                        .map((product, idx) => {
                          const stock = typeof product.stock === "number" ? product.stock : (product.inStock ? 1 : 0);
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-4 bg-red-50 border-l-4 border-red-400 rounded hover:bg-red-100 transition"
                            >
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800">{product.name || product.title || "Unknown Product"}</p>
                                <p className="text-sm text-gray-600">Category: {product.category || "Uncategorized"}</p>
                                <p className="text-sm text-gray-600">Price: PKR {Number(product.price || 0).toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                <div className="bg-red-600 text-white rounded-lg px-4 py-2 font-bold text-lg">
                                  {stock} {stock === 1 ? "Item" : "Items"}
                                </div>
                                <button
                                  onClick={() => openProductEditor(product)}
                                  className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                >
                                  Update Stock
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeView === "users" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Manage Users</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-sm text-gray-500">
                      <th className="py-2">Full Name</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Address</th>
                      <th className="py-2">Phone</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-gray-500">No users found</td></tr>}
                    {users.map((u) => (
                      <tr key={u._id} className="border-t">
                        <td className="py-3">{u.name || u.fullName || "-"}</td>
                        <td className="py-3">{u.email || "-"}</td>
                        <td className="py-3">{u.address || "-"}</td>
                        <td className="py-3">{u.phone || "-"}</td>
                        <td className="py-3">
                          <button onClick={() => handleDeleteUser(u._id)} className="text-red-600 hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === "orders" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Manage Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-sm text-gray-500">
                      <th className="py-2">User</th>
                      <th className="py-2">Contact</th>
                      <th className="py-2">Items</th>
                      <th className="py-2">Total</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 && <tr><td colSpan={6} className="py-4 text-center text-gray-500">No orders found</td></tr>}
                    {orders.map((o) => (
                      <tr key={o._id} className="border-t align-top">
                        <td className="py-3">{o.user?.name || o.userName || o.customerName || "-"}</td>
                        <td className="py-3">{o.user?.phone || o.contact || o.phone || "-"}</td>
                        <td className="py-3">
                          {Array.isArray(o.items) ? (
                            <ul className="list-disc pl-5">
                              {o.items.map((it, i) => (
                                <li key={i}>{(it.product && (it.product.name || it.product.title)) || it.name || it.title || it.productName || "item"} x{typeof it.quantity !== "undefined" ? it.quantity : (it.qty || 1)}</li>
                              ))}
                            </ul>
                          ) : (
                            <span>{String(o.items || "-")}</span>
                          )}
                        </td>
                        <td className="py-3">{`PKR ${Number(o.total || o.amount || 0).toLocaleString()}`}</td>
                        <td className="py-3">{o.status || "pending"}</td>
                        <td className="py-3 space-x-2">
                          <div className="flex items-center gap-2">
                            <button
                              title={o.status === "confirmed" ? "Mark as Unconfirmed" : "Mark as Confirmed"}
                              onClick={() => handleUpdateOrderStatus(o._id, o.status === "confirmed" ? "pending" : "confirmed")}
                              className={`px-2 py-1 rounded font-medium ${o.status === "confirmed"
                                ? "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                                : "bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer"
                                }`}
                            >
                              <Icon name="check" size={17} />
                            </button>

                            <button
                              title={o.status === "delivered" ? "Move back to Confirmed" : "Mark as Delivered"}
                              onClick={() => handleUpdateOrderStatus(o._id, o.status === "delivered" ? "confirmed" : "delivered")}
                              disabled={o.status !== "confirmed" && o.status !== "delivered"}
                              className={`px-2 py-1 rounded font-medium ${o.status === "delivered"
                                ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                : o.status === "confirmed"
                                  ? "bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                }`}
                            >
                              <Icon name="truck" size={17} />
                            </button>

                            <button
                              title="Delete Order"
                              onClick={() => handleDeleteOrder(o._id)}
                              className="px-2 py-1 rounded font-medium bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer"
                            >
                              <Icon name="x" size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === "products" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Categories</h2>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Add Product
                </button>
              </div>
              {productCategories.length === 0 && (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">No products available</div>
              )}
              {productCategories.map(([category, items]) => (
                <div key={category} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{category}</h3>
                      <p className="text-sm text-gray-500">{items.length} products</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-sm text-gray-500">
                          <th className="py-2">Name</th>
                          <th className="py-2">Price</th>
                          <th className="py-2">Offer Price</th>
                          <th className="py-2">Qty</th>
                          <th className="py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((product) => (
                          <tr key={product._id || product.id} className="border-t">
                            <td className="py-3">{product.name || product.title || "-"}</td>
                            <td className="py-3">PKR {Number(product.price || 0).toLocaleString()}</td>
                            <td className="py-3">PKR {Number(product.offerPrice || 0).toLocaleString()}</td>
                            <td className="py-3">
                              {typeof product.stock === "number"
                                ? product.stock
                                : product.inStock
                                  ? 1
                                  : 0}
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openProductEditor(product)}
                                  className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product._id || product.id)}
                                  className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeView === "receipts" && (
            <div className="space-y-6">
              <div>
                <p className="mb-1 text-sm font-medium text-[#2d72d9]">Order documents</p>
                <h2 className="text-2xl font-bold text-slate-900">Receipts</h2>
                <p className="mt-1 text-sm text-slate-500">Create customer or internal admin receipts for every order.</p>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="bg-slate-50 text-sm text-slate-500"><tr><th className="px-5 py-3">Order</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Receipt types</th></tr></thead>
                  <tbody>
                    {orders.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">No orders available for receipts</td></tr>}
                    {orders.map((order) => (
                      <tr key={order._id} className="border-t border-slate-100 align-top">
                        <td className="px-5 py-4"><p className="font-semibold text-slate-800">#{String(order._id || "").slice(-8) || "-"}</p><p className="text-xs text-slate-500">{order.status || "Order Placed"}</p></td>
                        <td className="px-5 py-4"><p className="font-medium text-slate-800">{getReceiptCustomerName(order)}</p><p className="text-xs text-slate-500">{order.contact || order.address?.phone || "No phone"}</p></td>
                        <td className="px-5 py-4 text-sm text-slate-600">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-800">PKR {Number(order.total || order.amount || 0).toLocaleString()}</td>
                        <td className="px-5 py-4"><div className="flex flex-wrap gap-2"><button onClick={() => openReceipt(order, "customer")} className="flex items-center gap-1.5 rounded-lg bg-[#101b2d] px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"><Icon name="eye" size={14} /> Customer</button><button onClick={() => openReceipt(order, "admin")} className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Icon name="file" size={14} /> Admin</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {productToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-semibold">Edit Product</h3>
              <button
                onClick={closeProductEditor}
                className="text-gray-500 hover:text-gray-700"
              >
                <Icon name="x" size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Offer Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editOfferPrice}
                  onChange={(e) => setEditOfferPrice(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Qty</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={editStock}
                  onChange={(e) => setEditStock(Number(e.target.value))}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  onClick={closeProductEditor}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProductEdits}
                  disabled={savingProduct}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {savingProduct ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-semibold">Add New Product</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-gray-500 hover:text-gray-700" aria-label="Close"><Icon name="x" size={20} /></button>
            </div>

            <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="border rounded-lg p-4 h-full flex flex-col items-center justify-start">
                  <div className="w-full h-64 bg-gray-50 rounded overflow-hidden flex items-center justify-center mb-4">
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-gray-400">Image preview</div>
                    )}
                  </div>
                  <div className="w-full flex flex-col items-center">
                    <input id="admin-new-image" type="file" accept="image/*" onChange={handleImageChangeForNew} hidden />
                    <label htmlFor="admin-new-image" className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded text-sm cursor-pointer hover:bg-gray-50">
                      Choose File
                    </label>
                    {newProduct.images && newProduct.images.length > 0 && (
                      <span className="mt-2 text-sm text-gray-600">{newProduct.images[0].name}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <input className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2" value={newProduct.name} onChange={(e) => setNewProduct(p => ({ ...p, name: e.target.value }))} required />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 resize-none" rows={5} value={newProduct.description} onChange={(e) => setNewProduct(p => ({ ...p, description: e.target.value }))} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <select className="rounded-lg border border-gray-300 px-3 py-2 cursor-pointer" value={newProduct.category} onChange={(e) => setNewProduct(p => ({ ...p, category: e.target.value }))}>
                    <option value="">Select Category</option>
                    {categories.slice(0, 8).map((c, i) => (
                      <option key={i} value={c.path || c.name || c.title}>{c.path || c.name || c.title}</option>
                    ))}
                  </select>
                  <input placeholder="MRP" type="number" className="rounded-lg border border-gray-300 px-3 py-2" value={newProduct.price} onChange={(e) => setNewProduct(p => ({ ...p, price: e.target.value }))} />
                  <input placeholder="Offer Price" type="number" className="rounded-lg border border-gray-300 px-3 py-2" value={newProduct.offerPrice} onChange={(e) => setNewProduct(p => ({ ...p, offerPrice: e.target.value }))} />
                  <input placeholder="Stock" type="number" className="rounded-lg border border-gray-300 px-3 py-2" value={newProduct.stock} onChange={(e) => setNewProduct(p => ({ ...p, stock: Number(e.target.value) || 0 }))} min="0" />
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-3">
                    <button type="button" className="px-4 py-2 rounded border border-gray-300">Add to Cart</button>
                    <button type="button" className="px-4 py-2 rounded bg-blue-600 text-white">Buy Now</button>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => { setShowAddProductModal(false) }} className="px-4 py-2 rounded border border-gray-300">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white">Add Product</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedReceipt && (
        <ReceiptModal
          order={selectedReceipt}
          receiptType={receiptType}
          setReceiptType={setReceiptType}
          onClose={() => setSelectedReceipt(null)}
          onPrint={printReceipt}
          onDownload={downloadReceipt}
        />
      )}

      {showProfileModal && <AdminProfileModal adminUser={adminUser} onClose={() => setShowProfileModal(false)} />}
    </div>
  );
};

export default AdminDashboard;

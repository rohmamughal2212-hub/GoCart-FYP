import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";
axios.defaults.baseURL = rawBackendUrl.replace(/^"|"$/g, "");

axios.interceptors.request.use((config) => {
  const userToken = localStorage.getItem("userToken");
  if (userToken) config.headers.Authorization = `Bearer ${userToken}`;
  return config;
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.config || error.response) {
      return Promise.reject(error);
    }

    if (error.message === "Network Error") {
      if (!error.config._retry) {
        error.config._retry = true;
        await delay(500);
        return axios(error.config);
      }
      error.message = "Backend is restarting or unreachable. Please wait a few seconds and retry.";
    }

    return Promise.reject(error);
  }
);

export const AppContext = createContext(null);

const GUEST_CART_KEY = "guest_cart";

// Only show products from these 8 categories on home page
const ALLOWED_CATEGORIES = ["Electronics", "Sports", "Grocery", "Meat", "Beauty", "Kitchen", "Garments", "Baby"];

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [clickCounts, setClickCounts] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("product_click_counts");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [categoryClickCounts, setCategoryClickCounts] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("category_click_counts");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");
      if (data.success) {
        setUser(data.user);
        const guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "{}");
        const merged = { ...data.user.cartItems };
        for (const [id, qty] of Object.entries(guestCart)) {
          merged[id] = (merged[id] || 0) + qty;
        }
        localStorage.removeItem(GUEST_CART_KEY);
        setCartItems(merged);
        setWishlist(data.user.wishlist || []);
      } else {
        const guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "{}");
        setCartItems(guestCart);
      }
    } catch {
      const guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "{}");
      setCartItems(guestCart);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchProducts = async (retry = 0) => {
    setProductsLoading(true);
    try {
      const { data } = await axios.get(`/api/product/list?limit=1000&_=${Date.now()}`);
      if (data && data.success) {
        // Filter products to only include the 8 allowed categories.
        // Use substring, case-insensitive match so categories like
        // "Baby Items" count for allowed key "Baby".
        const filtered = (data.products || []).filter((p) =>
          ALLOWED_CATEGORIES.some((cat) =>
            (p.category || "").toString().toLowerCase().includes(cat.toLowerCase())
          )
        );
        setProducts(filtered);
      } else if (data && !data.success) {
        const msg = data.message || "No products returned";
        toast.error(msg);
        setProducts([]);
      } else {
        toast.error("Unexpected response from products API");
        setProducts([]);
      }
    } catch (error) {
      const msg = (error && error.response && error.response.data && error.response.data.message) || error.message || String(error);
      console.error("fetchProducts error:", error);
      // Try one retry if this was likely a transient error
      if (retry < 1) {
        console.warn("Retrying fetchProducts once after error...");
        setTimeout(() => fetchProducts(retry + 1), 500);
      }
      toast.error(`Failed to load products. ${msg}`);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const addToCart = (itemId) => {
    const product = products.find((item) => String(item._id) === String(itemId));
    const hasStock = product && (product.stock !== undefined && product.stock !== null
      ? Number(product.stock) > 0
      : product.inStock !== false);
    if (product && !hasStock) {
      toast.error("This product is out of stock");
      return;
    }
    const availableStock = product && product.stock !== undefined && product.stock !== null
      ? Math.max(0, Math.floor(Number(product.stock)))
      : null;
    if (availableStock !== null && (cartItems[itemId] || 0) >= availableStock) {
      toast.error(`Only ${availableStock} available`);
      return;
    }
    const cart = { ...cartItems };
    cart[itemId] = (cart[itemId] || 0) + 1;
    setCartItems(cart);
    toast.success("Added to cart");
  };

  const updateCartItem = (itemId, quantity) => {
    const product = products.find((item) => String(item._id) === String(itemId));
    const availableStock = product && product.stock !== undefined && product.stock !== null
      ? Math.max(0, Math.floor(Number(product.stock)))
      : null;
    const nextQuantity = availableStock === null
      ? Math.max(1, Math.floor(Number(quantity)))
      : Math.min(availableStock, Math.max(1, Math.floor(Number(quantity))));
    setCartItems({ ...cartItems, [itemId]: nextQuantity });
  };

  const recordProductClick = (productId, category) => {
    setClickCounts((current) => {
      const next = { ...current, [productId]: (current[productId] || 0) + 1 };
      try {
        localStorage.setItem("product_click_counts", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    if (category) {
      setCategoryClickCounts((current) => {
        const next = { ...current, [category]: (current[category] || 0) + 1 };
        try {
          localStorage.setItem("category_click_counts", JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
  };

  const removeFromCart = (itemId) => {
    const cart = { ...cartItems };
    if (!cart[itemId]) return;
    cart[itemId] -= 1;
    if (cart[itemId] === 0) delete cart[itemId];
    setCartItems(cart);
    toast.success("Removed from cart");
  };

  const cartCount = () => Object.values(cartItems).reduce((s, q) => s + q, 0);

  const totalCartAmount = () => {
    let total = 0;
    for (const [id, qty] of Object.entries(cartItems)) {
      const product = products.find((p) => p._id === id);
      if (product) total += qty * product.offerPrice;
    }
    return Math.floor(total * 100) / 100;
  };

  const toggleWishlist = async (productId) => {
    if (!user) { setShowUserLogin(true); return; }
    try {
      const { data } = await axios.post("/api/user/wishlist/toggle", { productId });
      if (data.success) { setWishlist(data.wishlist); toast.success(data.message); }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const isInWishlist = (productId) =>
    wishlist.some((item) => String(typeof item === "object" ? item._id : item) === String(productId));

  useEffect(() => {
    fetchProducts();
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      axios.post("/api/cart/update", { cartItems }).catch(() => { });
    } else if (!userLoading) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const value = {
    navigate, user, setUser, userLoading, productsLoading,
    showUserLogin, setShowUserLogin,
    products, fetchProducts,
    cartItems, setCartItems,
    addToCart, updateCartItem, removeFromCart,
    cartCount, totalCartAmount,
    searchQuery, setSearchQuery,
    wishlist, setWishlist, toggleWishlist, isInWishlist,
    clickCounts, categoryClickCounts, recordProductClick,
    fetchUser,
    axios,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);

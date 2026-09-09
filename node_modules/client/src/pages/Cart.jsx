import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets, dummyProducts, electronicsProducts } from "../assets/assets";
import toast from "react-hot-toast";

const isProductInStock = (product) => product.stock !== undefined && product.stock !== null
  ? Number(product.stock) > 0
  : product.inStock !== false;

const Cart = () => {
  const {
    products, fetchProducts, navigate,
    cartCount, totalCartAmount,
    cartItems, setCartItems,
    removeFromCart, updateCartItem,
    axios, user, setShowUserLogin,
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);
  const [address, setAddress] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");
  const [placing, setPlacing] = useState(false);

  /* ── build cart array from context ── */
  useEffect(() => {
    if (!products.length) return;
    const arr = [];
    for (const key in cartItems) {
      const product = products.find((p) => p._id === key);
      if (product) arr.push({ ...product, quantity: cartItems[key] });
    }
    setCartArray(arr);
  }, [products, cartItems]);

  /* ── load saved addresses (only when logged in) ── */
  useEffect(() => {
    if (!user) return;
    axios.get("/api/address/get").then(({ data }) => {
      if (data.success) {
        setAddress(data.addresses);
        if (data.addresses.length > 0) setSelectedAddress(data.addresses[0]);
      }
    });
  }, [user]);



  const subtotal = totalCartAmount();
  const shippingCharge = 250;
  const total = subtotal + shippingCharge;
  const hasUnavailableItems = cartArray.some((product) => !isProductInStock(product));

  /* ── place order ── */
  const placeOrder = async () => {
    if (!user) { setShowUserLogin(true); return; }
    if (!selectedAddress) return toast.error("Please select a delivery address");
    setPlacing(true);
    try {
      const orderItems = Object.entries(cartItems).map(([product, quantity]) => ({
        product,
        quantity: Number(quantity),
      }));
      const addressId = selectedAddress?._id || selectedAddress?.id || selectedAddress;
      const { data } = await axios.post("/api/order/cod", {
        items: orderItems,
        address: addressId,
      });
      if (data.success) {
        toast.success(data.message);
        await fetchProducts();
        setCartItems({});
        navigate("/my-orders");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally { setPlacing(false); }
  };

  /* ── empty cart ── */
  if (cartCount() === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <svg viewBox="0 0 64 64" className="w-20 h-20 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M8 8h8l8 32a4 4 0 004 3h24a4 4 0 003.9-3l5-22H16" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="24" cy="52" r="4" />
          <circle cx="48" cy="52" r="4" />
        </svg>
        <p className="text-2xl text-gray-400 font-medium">Your cart is empty</p>
        <p className="text-gray-400 text-sm">Browse our products and add something you like!</p>
        <button
          onClick={() => navigate("/products")}
          className="mt-2 px-8 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition cursor-pointer font-medium"
        >
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row py-16 max-w-6xl w-full px-6 mx-auto gap-8">

      {/* ── Left: Cart items (visible to everyone) ── */}
      <div className="flex-1">
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart{" "}
          <span className="text-sm text-indigo-500">{cartCount()} item{cartCount() !== 1 ? "s" : ""}</span>
        </h1>

        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3 border-b border-gray-200">
          <p>Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {cartArray.map((product) => (
          <div key={product._id}
            className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium py-4 border-b border-gray-100">
            {/* Product */}
            <div className="flex items-center gap-3 md:gap-5">
              <div
                onClick={() => { navigate(`/product/${product.category}/${product._id}`); scrollTo(0, 0); }}
                className="cursor-pointer w-20 h-20 md:w-24 md:h-24 shrink-0 flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
              >
                <img
                  className="w-full h-full object-cover"
                  src={(() => {
                    try {
                      let first = product?.image && product.image[0];
                      if (!first) {
                        const bundled = [...dummyProducts, ...electronicsProducts].find((p) => p._id === product._id);
                        first = bundled?.image && bundled.image[0];
                      }
                      if (!first) return assets.profile_icon;
                      if (typeof first === 'string') return first.trim() || assets.profile_icon;
                      if (typeof first === 'object') return (first.url || first.secure_url || first.path || first.src) || assets.profile_icon;
                      return assets.profile_icon;
                    } catch (e) {
                      return assets.profile_icon;
                    }
                  })()}
                  alt={product.name}
                />
              </div>
              <div>
                <p className="font-semibold text-gray-800 line-clamp-2">{product.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
                {!isProductInStock(product) && <p className="mt-1 text-xs font-semibold text-red-600">Out of stock</p>}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-xs text-gray-500">Qty:</span>
                  <div className="flex h-8 items-center overflow-hidden rounded border border-gray-200 bg-white">
                    <button
                      type="button"
                      onClick={() => removeFromCart(product._id)}
                      className="h-full px-2 text-gray-600 transition hover:bg-gray-100"
                      aria-label={`Decrease ${product.name} quantity`}
                    >−</button>
                    <span className="min-w-8 text-center text-sm text-gray-700">{cartItems[product._id]}</span>
                    <button
                      type="button"
                      onClick={() => updateCartItem(product._id, cartItems[product._id] + 1)}
                      disabled={product.stock !== undefined && product.stock !== null && cartItems[product._id] >= Number(product.stock)}
                      className="h-full px-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Increase ${product.name} quantity`}
                    >+</button>
                  </div>
                  {product.stock !== undefined && product.stock !== null && (
                    <span className="text-xs text-gray-400">of {product.stock}</span>
                  )}
                </div>
              </div>
            </div>
            {/* Subtotal */}
            <p className="text-center font-medium">Rs. {(product.offerPrice * product.quantity).toFixed(0)}</p>
            {/* Remove */}
            <button onClick={() => removeFromCart(product._id)} className="cursor-pointer mx-auto text-gray-400 hover:text-red-500 transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="m12.5 7.5-5 5m0-5 5 5m5.833-2.5a8.333 8.333 0 1 1-16.667 0 8.333 8.333 0 0 1 16.667 0"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ))}

        <button
          onClick={() => navigate("/products")}
          className="flex items-center mt-8 gap-2 text-indigo-500 font-medium hover:underline cursor-pointer"
        >
          <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
            <path d="M14.09 5.5H1M6.143 10 1 5.5 6.143 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Continue Shopping
        </button>
      </div>

      {/* ── Right: Order summary ── */}
      <div className="max-w-[360px] w-full self-start">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h2 className="text-xl font-semibold mb-5">Order Summary</h2>

          {/* Totals — visible to everyone */}
          <div className="text-gray-500 space-y-2 text-sm">
            <p className="flex justify-between"><span>Subtotal</span><span>Rs. {subtotal.toFixed(0)}</span></p>
            <p className="flex justify-between"><span>Shipping</span><span>Rs. {shippingCharge.toFixed(0)}</span></p>
          </div>
          <div className="border-t border-gray-200 my-4" />
          <p className="flex justify-between text-lg font-semibold text-gray-900">
            <span>Total</span><span>Rs. {total.toFixed(0)}</span>
          </p>

          {/* ── Guest: prompt login to checkout ── */}
          {!user ? (
            <div className="mt-6 rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-center">
              <p className="text-sm text-gray-600 mb-3">
                Sign in to complete your purchase
              </p>
              <button
                onClick={() => setShowUserLogin(true)}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition cursor-pointer"
              >
                Login to Checkout
              </button>
              <p className="text-xs text-gray-400 mt-2">Your cart is saved and will stay after login</p>
            </div>
          ) : (
            <>
              {/* Delivery Address */}
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Delivery Address</p>
                <div className="relative">
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-600 flex-1 pr-2">
                      {selectedAddress
                        ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`
                        : <span className="text-gray-400 italic">No address found</span>}
                    </p>
                    <button
                      onClick={() => setShowAddress(!showAddress)}
                      className="text-indigo-500 text-xs hover:underline cursor-pointer shrink-0"
                    >
                      Change
                    </button>
                  </div>
                  {showAddress && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                      {address.map((addr, i) => (
                        <p key={i}
                          onClick={() => { setSelectedAddress(addr); setShowAddress(false); }}
                          className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                        >
                          {addr.street}, {addr.city}, {addr.state}, {addr.country}
                        </p>
                      ))}
                      <p
                        onClick={() => navigate("/add-address")}
                        className="px-3 py-2 text-sm text-indigo-500 hover:bg-indigo-50 cursor-pointer font-medium"
                      >
                        + Add new address
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Payment Method</p>
                <select
                  value={paymentOption}
                  onChange={(e) => setPaymentOption(e.target.value)}
                  className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 cursor-pointer"
                >
                  <option value="COD">Cash On Delivery</option>
                </select>
              </div>


              {/* Place Order */}
              <button
                onClick={placeOrder}
                disabled={placing || hasUnavailableItems}
                className="w-full py-3 mt-6 cursor-pointer bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {placing && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {hasUnavailableItems ? "Remove out-of-stock item" : placing ? "Processing…" : paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;

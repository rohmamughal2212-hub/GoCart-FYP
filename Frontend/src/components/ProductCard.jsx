import { useState } from "react";
import { assets, dummyProducts, electronicsProducts } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
    />
  </svg>
);

const ProductCard = ({ product }) => {
  const { addToCart, removeFromCart, cartItems, navigate, toggleWishlist, isInWishlist, recordProductClick, clickCounts } = useAppContext();
  const [wishPending, setWishPending] = useState(false);
  const inWishlist = isInWishlist(product?._id);

  if (!product) return null;

  const isInStock = product.stock !== undefined && product.stock !== null
    ? Number(product.stock) > 0
    : product.inStock !== false;
  const cartQuantity = cartItems?.[product._id] || 0;
  const atStockLimit = product.stock !== undefined && product.stock !== null
    && cartQuantity >= Number(product.stock);

  const getImageSrc = () => {
    try {
      let first = product?.image && product.image[0];
      // If backend returned empty image array, fall back to bundled dummy images
      if (!first) {
        // Try matching by _id first
        let bundled = [...dummyProducts, ...electronicsProducts].find((p) => p._id === product._id);
        // If not found by _id, try matching by name (for backend products)
        if (!bundled) {
          bundled = [...dummyProducts, ...electronicsProducts].find(
            (p) => p.name && product.name && p.name.toLowerCase() === product.name.toLowerCase()
          );
        }
        // If still not found, try partial name match in category
        if (!bundled && product.category) {
          bundled = [...dummyProducts, ...electronicsProducts].find(
            (p) => (p.category || "").toLowerCase() === (product.category || "").toLowerCase() &&
              p.name && product.name && p.name.toLowerCase().includes(product.name.toLowerCase().split(' ')[0])
          );
        }
        first = bundled?.image && bundled.image[0];
      }
      if (!first) return assets.profile_icon;
      if (typeof first === "string") return first.trim() || assets.profile_icon;
      if (typeof first === "object") return (first.url || first.secure_url || first.path || first.src) || assets.profile_icon;
      return assets.profile_icon;
    } catch {
      return assets.profile_icon;
    }
  };
  const imgSrc = getImageSrc();

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (wishPending) return;
    setWishPending(true);
    await toggleWishlist(product._id);
    setWishPending(false);
  };

  return (
    <div
      onClick={() => {
        recordProductClick(product._id, product.category);
        navigate(`/product/${product.category.toLowerCase()}/${product._id}`);
        scrollTo(0, 0);
      }}
      className="relative bg-white cursor-pointer hover:shadow-xl transition-shadow duration-200 group flex flex-col h-full rounded-lg overflow-hidden border border-gray-200"
    >
      {/* Wishlist heart — top-right */}
      <button
        onClick={handleWishlist}
        disabled={wishPending}
        title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        className={`absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full transition-all cursor-pointer
          ${inWishlist
            ? "text-red-500 bg-red-50 opacity-100"
            : "text-gray-300 bg-white/80 opacity-0 group-hover:opacity-100 hover:text-red-400"}
          ${wishPending ? "opacity-50" : ""}
          shadow-sm border border-gray-100`}
      >
        <HeartIcon filled={inWishlist} />
      </button>

      {/* Product image */}
      <div className="bg-gray-50 flex items-center justify-center p-4 min-h-[14rem]">
        <img
          className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
          src={imgSrc}
          alt={product.name}
          onError={(e) => { e.currentTarget.src = assets.profile_icon; }}
        />
      </div>

      {/* Info */}
      <div className="text-sm mt-3 flex-1 flex flex-col justify-between px-4 pb-4">
        <div>
          <div className="flex items-center justify-between gap-2 mt-2">
            <div>
              <p className="text-gray-400 text-xs">{product.category}</p>
              <p className="text-gray-800 font-semibold text-base mt-1" style={{ lineHeight: '1.2', maxHeight: '4.2rem', overflow: 'hidden' }}>{product.name}</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-semibold px-2 py-1">
                <svg viewBox="0 0 20 20" className="w-3 h-3" fill="currentColor">
                  <path d="M10 4.5C6.5 4.5 3.5 6.8 2 10c1.5 3.2 4.5 5.5 8 5.5s6.5-2.3 8-5.5c-1.5-3.2-4.5-5.5-8-5.5zm0 9a3.5 3.5 0 110-7 3.5 3.5 0 010 7zm0-5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                </svg>
                {clickCounts[product._id] || 0}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-0.5 text-gray-400 text-xs mt-2">
            {Array(5).fill("").map((_, i) => (
              <img key={i} src={i < 4 ? assets.star_icon : assets.star_dull_icon} alt="" className="w-3" />
            ))}
            <span>(4)</span>
          </div>
        </div>

        {/* Price + Cart — always at bottom */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="text-indigo-600 font-semibold text-lg truncate">Rs. {product.offerPrice}</div>
            <div className="text-gray-400 text-xs line-through">Rs. {product.price}</div>
            {!isInStock && <div className="mt-1 text-xs font-semibold text-red-600">Out of stock</div>}
          </div>

          {/* Cart controls — stop propagation so click doesn't navigate */}
          <div onClick={(e) => e.stopPropagation()} className="flex-none w-full sm:w-auto">
            {!isInStock ? (
              <span className="inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-500">
                Out of stock
              </span>
            ) : !cartItems?.[product._id] ? (
              <button
                onClick={() => addToCart(product._id)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded-md text-white font-medium cursor-pointer transition-colors text-sm shadow-sm"
              >
                <img src={assets.cart_icon} alt="" className="w-4" />
                Add
              </button>
            ) : (
              <div className="flex items-center gap-1 h-10 bg-indigo-500 rounded-lg select-none text-white text-sm">
                <button
                  onClick={() => removeFromCart(product._id)}
                  className="cursor-pointer px-3 h-full hover:bg-indigo-600 rounded-l-lg transition-colors font-bold"
                >−</button>
                <span className="w-6 text-center font-medium">{cartItems[product._id]}</span>
                <button
                  onClick={() => addToCart(product._id)}
                  disabled={atStockLimit}
                  title={atStockLimit ? "Maximum available quantity reached" : "Increase quantity"}
                  className="cursor-pointer px-3 h-full hover:bg-indigo-600 rounded-r-lg transition-colors font-bold disabled:cursor-not-allowed disabled:opacity-50"
                >+</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

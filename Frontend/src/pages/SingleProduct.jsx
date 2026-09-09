import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { PageSpinner } from "../components/Loading";
import toast from "react-hot-toast";
import { assets, dummyProducts, electronicsProducts } from "../assets/assets";

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange && onChange(star)}
        className={`text-2xl ${star <= value ? "text-yellow-400" : "text-gray-300"} ${onChange ? "cursor-pointer hover:text-yellow-300" : "cursor-default"}`}
      >
        ★
      </button>
    ))}
  </div>
);

const SingleProduct = () => {
  const { products, navigate, addToCart, user, axios, toggleWishlist, isInWishlist } = useAppContext();
  const { id } = useParams();
  const [thumbnail, setThumbnail] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const product = products.find((p) => p._id === id);
  const isInStock = product && (product.stock !== undefined && product.stock !== null
    ? Number(product.stock) > 0
    : product.inStock !== false);

  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  // Helper to get product images with fallback
  const getProductImages = (prod) => {
    if (!prod) return [];
    
    // If product has images, return them
    if (prod.image && Array.isArray(prod.image) && prod.image.length > 0) {
      return prod.image;
    }
    
    // Try to find bundled product by ID
    let bundled = [...dummyProducts, ...electronicsProducts].find((p) => p._id === prod._id);
    
    // If not found by ID, try by name
    if (!bundled) {
      bundled = [...dummyProducts, ...electronicsProducts].find(
        (p) => p.name && prod.name && p.name.toLowerCase() === prod.name.toLowerCase()
      );
    }
    
    // If still not found, try by category + first word match
    if (!bundled && prod.category) {
      bundled = [...dummyProducts, ...electronicsProducts].find(
        (p) => (p.category || "").toLowerCase() === (prod.category || "").toLowerCase() &&
               p.name && prod.name && p.name.toLowerCase().includes(prod.name.toLowerCase().split(' ')[0])
      );
    }
    
    return bundled?.image || [];
  };

  useEffect(() => {
    if (product) {
      const productCategoryLower = (product.category || "").toLowerCase();
      setRelatedProducts(
        products.filter((p) => (p.category || "").toLowerCase() === productCategoryLower && p._id !== product._id).slice(0, 8)
      );
    }
  }, [products, product]);

  useEffect(() => {
    setThumbnail(product?.image?.[0] || getProductImages(product)?.[0] || null);
  }, [product]);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/review/${id}`);
      if (data.success) {
        setReviews(data.reviews);
        setAvgRating(data.avgRating);
      }
    } catch {}
  };

  useEffect(() => {
    if (id) fetchReviews();
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Please login to submit a review");
    if (!reviewForm.comment.trim()) return toast.error("Please write a comment");
    setSubmitting(true);
    try {
      const { data } = await axios.post("/api/review/add", {
        productId: id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      if (data.success) {
        toast.success(data.message);
        setReviewForm({ rating: 5, comment: "" });
        fetchReviews();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      const { data } = await axios.delete(`/api/review/${reviewId}`);
      if (data.success) {
        toast.success("Review deleted");
        fetchReviews();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!product) return <PageSpinner />;

  const inWishlist = isInWishlist(product._id);

  return (
    <div className="mt-16 pb-16">
      {/* Breadcrumb */}
      <p className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-indigo-500">Home</Link>
        {" / "}
        <Link to="/products" className="hover:text-indigo-500">Products</Link>
        {" / "}
        <Link to={`/products/${product.category.toLowerCase()}`} className="hover:text-indigo-500">{product.category}</Link>
        {" / "}
        <span className="text-indigo-500">{product.name}</span>
      </p>

      {/* Product Detail */}
      <div className="flex flex-col md:flex-row gap-12 mt-4">
        {/* Images */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-3">
            {(getProductImages(product) || product.image || []).map((img, i) => (
              <div key={i} onClick={() => setThumbnail(img)} className="border max-w-20 border-gray-300 rounded overflow-hidden cursor-pointer hover:border-indigo-400">
                <img src={String(img || assets.profile_icon).trim()} alt={`thumb-${i}`} className="w-full object-cover" onError={(e)=> e.currentTarget.src = assets.profile_icon} />
              </div>
            ))}
          </div>
          <div className="border border-gray-300 max-w-96 rounded overflow-hidden">
            <img src={String(thumbnail || (getProductImages(product) || product.image)?.[0] || assets.profile_icon).trim()} alt={product.name} className="w-full object-cover" onError={(e)=> e.currentTarget.src = assets.profile_icon} />
          </div>
        </div>

        {/* Info */}
        <div className="w-full md:w-1/2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-medium">{product.name}</h1>
            <button
              onClick={() => toggleWishlist(product._id)}
              title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              className={`text-2xl mt-1 ${inWishlist ? "text-red-500" : "text-gray-300"} hover:text-red-400 cursor-pointer`}
            >
              ♥
            </button>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <StarRating value={Math.round(avgRating)} />
            <span className="text-sm text-gray-500">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
          </div>

          <div className="mt-6">
            <p className="text-gray-400 line-through">MRP: Rs. {product.price}</p>
            <p className="text-2xl font-medium">Price: Rs. {product.offerPrice}</p>
            <span className="text-gray-500/70 text-sm">(inclusive of all taxes)</span>
            {!isInStock && <p className="mt-2 text-sm font-semibold text-red-600">Out of stock</p>}
          </div>

          <p className="text-base font-medium mt-6 mb-2">About Product</p>
          <ul className="list-disc ml-4 text-gray-500/70 space-y-1">
            {product.description.map((desc, i) => (
              <li key={i}>{desc}</li>
            ))}
          </ul>

          <div className="flex items-center mt-10 gap-4">
            <button disabled={!isInStock} onClick={() => addToCart(product._id)} className="w-full py-3.5 font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition cursor-pointer rounded disabled:cursor-not-allowed disabled:opacity-60">
              {isInStock ? "Add to Cart" : "Out of stock"}
            </button>
            <button disabled={!isInStock} onClick={() => { addToCart(product._id); navigate("/cart"); scrollTo(0, 0); }} className="w-full py-3.5 font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition cursor-pointer rounded disabled:cursor-not-allowed disabled:opacity-60">
              {isInStock ? "Buy Now" : "Out of stock"}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-medium mb-6">Customer Reviews</h2>

        {/* Submit review form */}
        {user ? (
          <form onSubmit={submitReview} className="bg-gray-50 p-6 rounded-lg mb-8 max-w-2xl">
            <p className="font-medium mb-3">Write a Review</p>
            <StarRating value={reviewForm.rating} onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} />
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Share your experience..."
              rows={3}
              className="w-full mt-3 border border-gray-300 rounded px-3 py-2 outline-none focus:border-indigo-400 resize-none"
            />
            <button type="submit" disabled={submitting} className="mt-3 px-6 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-60 cursor-pointer">
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        ) : (
          <p className="text-gray-500 mb-6 text-sm">
            <button onClick={() => {}} className="text-indigo-500 hover:underline">Login</button> to write a review.
          </p>
        )}

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <p className="text-gray-400">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4 max-w-2xl">
            {reviews.map((r) => (
              <div key={r._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{r.user?.name || "User"}</span>
                    <StarRating value={r.rating} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    {user && r.user?._id === user._id && (
                      <button onClick={() => deleteReview(r._id)} className="text-xs text-red-400 hover:text-red-600 cursor-pointer">Delete</button>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-1">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="flex flex-col items-center mt-20">
          <p className="text-2xl font-medium">Related Products</p>
          <div className="w-20 h-0.5 bg-indigo-500 rounded-full mt-2 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedProducts.map((p, i) => (
              <ProductCard key={i} product={p} />
            ))}
          </div>
          <button onClick={() => { navigate("/products"); scrollTo(0, 0); }} className="mt-8 px-16 py-3 bg-indigo-500 text-white hover:bg-indigo-600 transition rounded cursor-pointer">
            See More
          </button>
        </div>
      )}
    </div>
  );
};

export default SingleProduct;

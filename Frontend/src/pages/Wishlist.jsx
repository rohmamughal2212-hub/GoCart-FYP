import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import { ProductSkeletonGrid } from "../components/Loading";

const Wishlist = () => {
  const { wishlist, products: catalogProducts, navigate, userLoading } = useAppContext();
  const products = wishlist
    .map((item) => {
      if (typeof item === "object" && item !== null) return item;
      return catalogProducts.find((product) => String(product._id) === String(item));
    })
    .filter(Boolean);

  if (userLoading) {
    return (
      <div className="mt-12 pb-16">
        <h1 className="text-3xl font-medium mb-8">My Wishlist</h1>
        <ProductSkeletonGrid count={5} />
      </div>
    );
  }

  return (
    <div className="mt-12 pb-16">
      <h1 className="text-3xl font-medium mb-2">My Wishlist</h1>
      <p className="text-gray-400 text-sm mb-8">{products.length} saved item{products.length !== 1 ? "s" : ""}</p>

      {products.length === 0 ? (
        <div className="text-center py-24">
          <svg viewBox="0 0 24 24" className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
          </svg>
          <p className="text-xl text-gray-400 mb-4">Your wishlist is empty</p>
          <p className="text-gray-400 text-sm mb-6">Save products you love by clicking the ♥ on any product card</p>
          <button
            onClick={() => navigate("/products")}
            className="px-8 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition cursor-pointer font-medium"
          >
            Explore Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;

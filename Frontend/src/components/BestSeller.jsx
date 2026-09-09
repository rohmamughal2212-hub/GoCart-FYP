import ProductCard from "./ProductCard";
import { ProductSkeletonGrid } from "./Loading";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";

const BestSeller = () => {
  const { products, productsLoading, clickCounts } = useAppContext();
  const best = products
    .filter((p) => p.inStock)
    .sort((a, b) => {
      const countA = clickCounts[a._id] || 0;
      const countB = clickCounts[b._id] || 0;
      if (countA !== countB) return countB - countA;
      return b._id.localeCompare(a._id);
    })
    .slice(0, 8);

  return (
    <div className="mt-16">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "#1B3A6B" }}>TRENDING NOW</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Best Products</h2>
          <div className="mt-2 h-1 w-12 rounded-full" style={{ background: "#1B3A6B" }} />
        </div>
        <Link to="/products" className="text-sm font-medium hover:underline cursor-pointer" style={{ color: "#1B3A6B" }}>
          View all →
        </Link>
      </div>

      {productsLoading ? (
        <ProductSkeletonGrid count={5} />
      ) : best.length === 0 ? (
        <p className="text-gray-400 text-sm py-8">No products available yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {best.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BestSeller;

import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import ProductCard from "./ProductCard";
import { categories as CATEGORY_LIST } from "../assets/assets";

const TrendingCarousel = () => {
  const { products = [], clickCounts = {} } = useAppContext();
  const [viewedProducts, setViewedProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const allowedCategories = CATEGORY_LIST.slice(0, 8).map((cat) => cat.path.toLowerCase());

  useEffect(() => {
    if (products.length === 0) return;

    const filtered = products.filter((product) =>
      allowedCategories.includes((product.category || "").toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      const aCount = clickCounts[a._id] || 0;
      const bCount = clickCounts[b._id] || 0;
      if (bCount !== aCount) return bCount - aCount;
      return a.name.localeCompare(b.name);
    });

    setViewedProducts(sorted.slice(0, 8));
  }, [products, clickCounts]);

  // Auto-cycle through products every 5 seconds
  useEffect(() => {
    if (viewedProducts.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(1, viewedProducts.length - 3));
    }, 5000);

    return () => clearInterval(timer);
  }, [viewedProducts]);

  if (viewedProducts.length === 0) return null;

  // Show 4 products at a time, cycling through the viewed products
  const displayedProducts = [];
  for (let i = 0; i < 4; i++) {
    const idx = (currentIndex + i) % viewedProducts.length;
    displayedProducts.push(viewedProducts[idx]);
  }

  return (
    <div className="mt-16">
      <div className="mb-1">
        <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "#1B3A6B" }}>
          POPULAR NOW
        </p>
        <p className="text-2xl md:text-3xl font-bold text-gray-900">Trending Products</p>
        <div className="mt-2 h-1 w-12 rounded-full" style={{ background: "#1B3A6B" }} />
      </div>

      {/* Single row carousel */}
      <div className="my-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 items-stretch">
        {displayedProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Carousel indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: Math.max(1, viewedProducts.length - 3) }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? "bg-indigo-600 w-8" : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to carousel position ${idx}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TrendingCarousel;

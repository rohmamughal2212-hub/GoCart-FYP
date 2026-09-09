import HeroSlider from "../components/HeroSlider";
import Category from "../components/Category";
import TrendingCarousel from "../components/TrendingCarousel";
import ProductCard from "../components/ProductCard";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";

const features = [
  { icon: "🚚", title: "Quick Delivery", desc: "On all orders, every day" },
  { icon: "📦", title: "Genuine Product", desc: "Sourced from local farms" },
  { icon: "🔒", title: "Secure Payment", desc: "Your data stays safe" },
  { icon: "↩️", title: "Easy Returns", desc: "Hassle-free refunds" },
];

const Home = () => {
  const { products = [], productsLoading } = useAppContext();

  // Helper function to get products by category
  const getProductsByCategory = (categoryName) => {
    return products
      .filter((p) => (p.category || "").toString().toLowerCase().includes(categoryName.toLowerCase()))
      .filter((p) => p.inStock)
      .slice(0, 5);
  };

  // Component for category section
  const CategorySection = ({ categoryName, title, icon }) => {
    const categoryProducts = getProductsByCategory(categoryName);
    if (categoryProducts.length === 0) return null;

    return (
      <div className="mt-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "#1B3A6B" }}>SHOP</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{icon} {title}</h2>
            <div className="mt-2 h-1 w-12 rounded-full" style={{ background: "#1B3A6B" }} />
          </div>
          <Link to={`/products/${categoryName.toLowerCase()}`} className="text-sm font-medium hover:underline cursor-pointer" style={{ color: "#1B3A6B" }}>
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categoryProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6 space-y-0">

      <HeroSlider />

      {/* Trust badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 border border-gray-100 rounded-xl overflow-hidden mt-6">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-3 bg-white px-5 py-4">
            <span className="text-2xl">{f.icon}</span>
            <div>
              <p className="font-semibold text-sm text-gray-800">{f.title}</p>
              <p className="text-xs text-gray-400">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <Category />

      {/* Trending Products Carousel */}
      <TrendingCarousel />

      {/* Individual category sections removed per request (keeping categories grid above) */}

      {/* Best Products section removed per request */}
    </div>
  );
};

export default Home;

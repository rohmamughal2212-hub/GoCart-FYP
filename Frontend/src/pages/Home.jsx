import HeroSlider from "../components/HeroSlider";
import Category from "../components/Category";
import TrendingCarousel from "../components/TrendingCarousel";

const features = [
  { icon: "🚚", title: "Quick Delivery", desc: "On all orders, every day" },
  { icon: "📦", title: "Genuine Product", desc: "Sourced from local farms" },
  { icon: "🔒", title: "Secure Payment", desc: "Your data stays safe" },
  { icon: "↩️", title: "Easy Returns", desc: "Hassle-free refunds" },
];

const Home = () => {
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

      {/* Best Products section removed per request */}
    </div>
  );
};

export default Home;

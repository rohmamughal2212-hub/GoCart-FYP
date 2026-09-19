import { categories } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { categoryMatches } from "../utils/categoryMatch";

const APPROVED_PUBLIC_CATEGORIES = [
  "Electronics",
  "Sports",
  "Grocery",
  "Meat",
  "Beauty",
  "Kitchen",
  "Garments",
  "Baby Items",
];

const isApprovedPublicProduct = (product) => {
  const category = (product?.category || "").toString().trim();
  return APPROVED_PUBLIC_CATEGORIES.includes(category);
};

const Category = () => {
  const { navigate, products } = useAppContext();
  const publicProducts = (products || []).filter(isApprovedPublicProduct);
  const counts = (categories || []).slice(0, 8).map((category) => {
    const catKey = (category.path || category.text || "").toString().toLowerCase().trim();
    const cnt = publicProducts.reduce((acc, p) => {
      return acc + (categoryMatches(p.category, catKey) ? 1 : 0);
    }, 0);
    return cnt;
  });

  const totalForEight = publicProducts.length;

  return (
    <div className="mt-16">
      <div className="mb-1">
        <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "#1B3A6B" }}>CATEGORIES</p>
        <p className="text-2xl md:text-3xl font-bold text-gray-900">Explore by Category</p>
        <p className="text-sm text-gray-600">Total: {totalForEight} products</p>
        <div className="mt-2 h-1 w-12 rounded-full" style={{ background: "#1B3A6B" }} />
      </div>
      <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categories.slice(0, 8).map((category, index) => {
          const count = counts[index] || 0;
          return (
            <div
              key={index}
              className="group cursor-pointer rounded-lg flex flex-col items-center justify-center p-4 min-h-[170px] text-center shadow-sm hover:shadow-md transition-shadow"
              style={{ backgroundColor: category.bgColor }}
              onClick={() => {
                navigate(`/products/${category.path.toLowerCase()}`);
                scrollTo(0, 0);
              }}
            >
              <div className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-xl bg-white/70 mb-3">
                <img
                  src={category.image}
                  alt={category.text}
                  className="w-14 h-14 md:w-16 md:h-16 object-contain transition-transform duration-200 group-hover:scale-110"
                />
              </div>
              <p className="text-base md:text-lg font-semibold text-gray-900">{category.text}</p>
              <p className="text-sm text-gray-600 mt-1">{count} products</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Category;

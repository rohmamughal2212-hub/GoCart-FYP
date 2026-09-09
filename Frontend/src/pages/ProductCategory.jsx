import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { categories as CATEGORY_LIST, dummyProducts, electronicsProducts } from "../assets/assets";
import ProductCard from "../components/ProductCard";
import { ProductSkeletonGrid } from "../components/Loading";
import { useAppContext } from "../context/AppContext";

const EXCLUDED_PRODUCT_IDS = new Set(["da8498941205efd19d8743db"]);
const isExcludedProduct = (product) => (
  EXCLUDED_PRODUCT_IDS.has(product._id)
  || (
    (product.name || "").toString().toLowerCase().trim() === "eggs dozen"
    && (product.category || "").toString().toLowerCase().trim() === "meat"
  )
);

export default function ProductCategory() {
  const { category } = useParams();
  const navigate = useNavigate();

  const { products: ctxProducts = [] } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const catInfo = CATEGORY_LIST.find((c) => c.path.toLowerCase() === category);

  useEffect(() => {
    setLoading(true);
    const catParam = encodeURIComponent(catInfo?.path || category);
    // Request all products in this category from backend
    axios
      .get(`/api/product/list?categories=${catParam}&limit=100`)
      .then(({ data }) => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          // Merge app-context products only when they EXACTLY match the category
          const apiProducts = data.products.filter((product) => !isExcludedProduct(product));
          const catKey = (catInfo?.path || category).toLowerCase().trim();
          const localMatches = (ctxProducts || []).filter(
            (p) => ((p.category || "").toString().toLowerCase().trim() === catKey)
              && !isExcludedProduct(p)
          );
          const mergedMap = new Map();
          apiProducts.forEach((p) => mergedMap.set(p._id, p));
          localMatches.forEach((p) => { if (!mergedMap.has(p._id)) mergedMap.set(p._id, p); });
          const merged = Array.from(mergedMap.values());
          setProducts(merged);
          setTotal(Math.max(data.total || apiProducts.length, merged.length));
        } else {
          // API returned no products — fallback to bundled dummy products or electronics dataset
          const catKey = (catInfo?.path || category).toLowerCase();
          const list = catKey === "electronics"
            ? electronicsProducts
            : dummyProducts.filter((p) => (p.category || "").toLowerCase() === catKey);
          setProducts(list);
          setTotal(list.length);
        }
      })
      .catch((err) => {
        console.error(err);
        // Network error — fallback to bundled dummy products or electronics dataset
        const catKey = (catInfo?.path || category).toLowerCase();
        const list = catKey === "electronics"
          ? electronicsProducts
          : dummyProducts.filter((p) => (p.category || "").toLowerCase() === catKey);
        setProducts(list);
        setTotal(list.length);
      })
      .finally(() => setLoading(false));
  }, [category, catInfo]);

  return (
    <div className="mt-16 pb-16">
      <div className="mb-6">
        <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "#1B3A6B" }}>CATEGORY</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          {catInfo ? catInfo.text : category}
        </h1>
        <div className="mt-2 h-1 w-12 rounded-full" style={{ background: "#1B3A6B" }} />
        {!loading && (
          <p className="text-sm text-gray-400 mt-2">{total} product{total !== 1 ? "s" : ""} available</p>
        )}
      </div>

      {loading ? (
        <ProductSkeletonGrid count={10} />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-4 text-gray-400">
          <p className="text-lg">No products in this category yet.</p>
          <button onClick={() => navigate("/products")}
            className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 cursor-pointer text-sm">
            Browse All Products
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-stretch">
            {products.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        </>
      )}
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { ProductSkeletonGrid } from "../components/Loading";
import { useAppContext } from "../context/AppContext";
import { categories as CATEGORY_LIST } from "../assets/assets";

// Only show products from these 8 categories
const ALLOWED_CATEGORIES = ["Electronics", "Sports", "Grocery", "Meat", "Beauty", "Kitchen", "Garments", "Baby"];
const matchesCategory = (productCategory, categoryKey) => {
  const productValue = (productCategory || "").toString().toLowerCase().trim();
  const selectedValue = (categoryKey || "").toString().toLowerCase().trim();
  return productValue === selectedValue || productValue.includes(selectedValue);
};

const PAGE_SIZE = 12;
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "name_asc", label: "Name: A → Z" },
  { value: "newest", label: "Newest First" },
];

/* ─── SVG helpers ─────────────────────────────────────────────── */
const ChevronDown = ({ open }) => (
  <svg viewBox="0 0 20 20" fill="currentColor"
    className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
    <path fillRule="evenodd" clipRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
  </svg>
);
const CloseX = ({ className = "w-3 h-3" }) => (
  <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
  </svg>
);

/* ─── Collapsible section (module-level — stable identity) ──────── */
const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-4 last:border-0">
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-left cursor-pointer group">
        <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">{title}</span>
        <ChevronDown open={open} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
};

/* ─── Sidebar filters (module-level — never recreated on re-render) ─
   Receiving all values as props means React keeps the same component
   instance across renders and inputs never lose focus.               */
const SidebarFilters = ({
  search, onSearchChange,
  draftCategories, onToggleCategory,
  draftPriceMin, onPriceMinChange,
  draftPriceMax, onPriceMaxChange,
  draftInStock, onInStockChange,
  meta,
  onClearAll,
  chips,
}) => (
  <div>
    {/* Search — debounced, no Apply needed */}
    <Section title="Search">
      <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-indigo-400 transition-colors bg-white">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 shrink-0">
          <path fillRule="evenodd" clipRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" />
        </svg>
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="outline-none bg-transparent text-sm w-full placeholder-gray-400"
        />
        {search && (
          <button onClick={() => onSearchChange("")}
            className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <CloseX />
          </button>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1.5">Updates 0.6 s after you stop typing</p>
    </Section>

    {/* Categories */}
    <Section title="Categories">
      <div className="space-y-2.5">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input type="checkbox" checked={draftCategories.length === 0}
            onChange={() => onToggleCategory(null)}
            className="w-4 h-4 rounded border-gray-300 accent-indigo-500 cursor-pointer" />
          <span className="text-sm text-gray-600 group-hover:text-indigo-600 transition-colors flex-1">All Categories</span>
        </label>
        {CATEGORY_LIST.slice(0, 8).map((cat) => {
          const categoryKey = cat.path.toLowerCase();
          const counts = Object.entries(meta.categoryCounts).reduce(
            (total, [name, value]) => name.toLowerCase().includes(categoryKey)
              ? { total: total.total + value.total, inStock: total.inStock + value.inStock }
              : total,
            { total: 0, inStock: 0 },
          );
          const count = counts ? (draftInStock ? counts.inStock : counts.total) : 0;
          return (
            <label key={cat.path} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={draftCategories.includes(cat.path)}
                onChange={() => onToggleCategory(cat.path)}
                className="w-4 h-4 rounded border-gray-300 accent-indigo-500 cursor-pointer" />
              <span className="text-sm text-gray-600 group-hover:text-indigo-600 transition-colors flex-1">{cat.text}</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{count}</span>
            </label>
          );
        })}
      </div>
    </Section>

    {/* Price Range */}
    <Section title="Price Range">
      <p className="text-xs text-gray-400 mb-3">Range: Rs. {meta.minPrice} – Rs. {meta.maxPrice}</p>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Min (Rs.)</label>
          <input
            type="number"
            min={meta.minPrice}
            value={draftPriceMin}
            onChange={(e) => onPriceMinChange(e.target.value)}
            placeholder={String(meta.minPrice)}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm outline-none focus:border-indigo-400 transition-colors"
          />
        </div>
        <span className="text-gray-400 pb-2">–</span>
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Max (Rs.)</label>
          <input
            type="number"
            max={meta.maxPrice}
            value={draftPriceMax}
            onChange={(e) => onPriceMaxChange(e.target.value)}
            placeholder={String(meta.maxPrice)}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm outline-none focus:border-indigo-400 transition-colors"
          />
        </div>
      </div>
    </Section>

    {/* Availability */}
    <Section title="Availability" defaultOpen={false}>
      <div className="space-y-2.5">
        {[{ val: false, label: "All Products" }, { val: true, label: "In Stock Only" }].map(({ val, label }) => (
          <label key={label} className="flex items-center gap-2.5 cursor-pointer group">
            <input type="radio" name="avail_draft" checked={draftInStock === val}
              onChange={() => onInStockChange(val)}
              className="w-4 h-4 accent-indigo-500 cursor-pointer" />
            <span className="text-sm text-gray-600 group-hover:text-indigo-600 transition-colors">{label}</span>
          </label>
        ))}
      </div>
    </Section>

    {/* Clear filters */}
    <div className="pt-4 space-y-2">
      {chips.length > 0 && (
        <button onClick={onClearAll}
          className="w-full py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 border border-red-200 cursor-pointer transition-colors font-medium">
          Clear All Filters
        </button>
      )}
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ════════════════════════════════════════════════════════════════ */
export default function Products() {
  const { searchQuery, setSearchQuery } = useAppContext();

  /* Draft (editing) state */
  const [draftCategories, setDraftCategories] = useState([]);
  const [draftPriceMin, setDraftPriceMin] = useState("");
  const [draftPriceMax, setDraftPriceMax] = useState("");
  const [draftInStock, setDraftInStock] = useState(false);

  /* Applied (sent to API) state */
  const [appliedCategories, setAppliedCategories] = useState([]);
  const [appliedPriceMin, setAppliedPriceMin] = useState("");
  const [appliedPriceMax, setAppliedPriceMax] = useState("");
  const [appliedInStock, setAppliedInStock] = useState(false);

  const [search, setSearch] = useState(searchQuery);
  const [sortBy, setSortBy] = useState("featured");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [meta, setMeta] = useState({ minPrice: 0, maxPrice: 1000, categoryCounts: {} });

  const searchTimer = useRef(null);

  const hasPending =
    JSON.stringify([...draftCategories].sort()) !== JSON.stringify([...appliedCategories].sort()) ||
    draftPriceMin !== appliedPriceMin ||
    draftPriceMax !== appliedPriceMax ||
    draftInStock !== appliedInStock;

  useEffect(() => { setSearch(searchQuery); }, [searchQuery]);

  useEffect(() => {
    axios.get("/api/product/meta")
      .then(({ data }) => { if (data.success) setMeta(data); })
      .catch(() => { });
  }, []);

  /* Core fetch */
  const fetchProducts = useCallback(async (targetPage) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (appliedCategories.length) params.set("categories", appliedCategories.join(","));
    if (appliedPriceMin !== "") params.set("minPrice", appliedPriceMin);
    if (appliedPriceMax !== "") params.set("maxPrice", appliedPriceMax);
    if (appliedInStock) params.set("inStock", "true");
    params.set("sort", sortBy);
    params.set("limit", 1000);

    try {
      const { data } = await axios.get(`/api/product/list?${params}`);
      const allProducts = Array.isArray(data.products) ? data.products : [];

      let filtered = allProducts.filter((p) => {
        if (!ALLOWED_CATEGORIES.some((category) => matchesCategory(p.category, category))) return false;

        if (appliedCategories.length) {
          const matchedCategory = appliedCategories.some((cat) =>
            matchesCategory(p.category, cat)
          );
          if (!matchedCategory) return false;
        }

        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesText = (p.name || "").toLowerCase().includes(q) ||
            (p.description?.[0] || "").toLowerCase().includes(q);
          if (!matchesText) return false;
        }

        if (appliedPriceMin !== "") {
          const min = parseFloat(appliedPriceMin);
          if ((p.offerPrice || p.price || 0) < min) return false;
        }
        if (appliedPriceMax !== "") {
          const max = parseFloat(appliedPriceMax);
          if ((p.offerPrice || p.price || 0) > max) return false;
        }

        if (appliedInStock && p.inStock === false) return false;

        return true;
      });

      if (sortBy === "price_asc") {
        filtered = [...filtered].sort((a, b) => (a.offerPrice || a.price || 0) - (b.offerPrice || b.price || 0));
      } else if (sortBy === "price_desc") {
        filtered = [...filtered].sort((a, b) => (b.offerPrice || b.price || 0) - (a.offerPrice || a.price || 0));
      } else if (sortBy === "name_asc") {
        filtered = [...filtered].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      } else if (sortBy === "newest") {
        filtered = [...filtered].sort((a, b) => {
          const aDate = new Date(a.createdAt || a.updatedAt || 0).getTime();
          const bDate = new Date(b.createdAt || b.updatedAt || 0).getTime();
          return bDate - aDate;
        });
      }

      const currentPage = targetPage ?? page;
      const start = (currentPage - 1) * PAGE_SIZE;
      const pageItems = filtered.slice(start, start + PAGE_SIZE);

      setProducts(pageItems);
      setTotal(filtered.length);
      setPages(Math.ceil(filtered.length / PAGE_SIZE));
    } catch (e) {
      console.error(e);
      setProducts([]);
      setTotal(0);
      setPages(0);
    } finally {
      setLoading(false);
    }
  }, [search, appliedCategories, appliedPriceMin, appliedPriceMax, appliedInStock, sortBy, page]);

  /* Re-fetch when applied filters / sort / page change */
  useEffect(() => {
    fetchProducts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedCategories, appliedPriceMin, appliedPriceMax, appliedInStock, sortBy, page]);

  /* Debounced search — 600 ms */
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(1); fetchProducts(1); }, 600);
    return () => clearTimeout(searchTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  /* Handlers */
  const handleSearchChange = (val) => { setSearch(val); setSearchQuery(val); };

  const handleToggleCategory = (cat) => {
    if (cat === null) {
      setDraftCategories([]);
      setAppliedCategories([]);
      setPage(1);
      return;
    }
    // Exclusive selection - only one category at a time
    const newCategories = [cat];
    setDraftCategories(newCategories);
    setAppliedCategories(newCategories);
    setPage(1);
  };

  const applyFilters = () => {
    setAppliedCategories([...draftCategories]);
    setAppliedPriceMin(draftPriceMin);
    setAppliedPriceMax(draftPriceMax);
    setAppliedInStock(draftInStock);
    setPage(1);
    setDrawerOpen(false);
  };

  const clearAll = () => {
    setDraftCategories([]); setAppliedCategories([]);
    setDraftPriceMin(""); setAppliedPriceMin("");
    setDraftPriceMax(""); setAppliedPriceMax("");
    setDraftInStock(false); setAppliedInStock(false);
    setSortBy("featured");
    setSearch(""); setSearchQuery("");
    setPage(1);
  };

  /* Active chips */
  const chips = [
    ...appliedCategories.map((c) => ({
      key: `cat-${c}`, label: c,
      remove: () => {
        setDraftCategories((p) => p.filter((x) => x !== c));
        setAppliedCategories((p) => p.filter((x) => x !== c));
        setPage(1);
      },
    })),
    ...(appliedPriceMin !== "" ? [{
      key: "pmin", label: `Min Rs. ${appliedPriceMin}`,
      remove: () => { setDraftPriceMin(""); setAppliedPriceMin(""); setPage(1); }
    }] : []),
    ...(appliedPriceMax !== "" ? [{
      key: "pmax", label: `Max Rs. ${appliedPriceMax}`,
      remove: () => { setDraftPriceMax(""); setAppliedPriceMax(""); setPage(1); }
    }] : []),
    ...(appliedInStock ? [{
      key: "stock", label: "In Stock",
      remove: () => { setDraftInStock(false); setAppliedInStock(false); setPage(1); }
    }] : []),
    ...(search ? [{
      key: "q", label: `"${search}"`,
      remove: () => handleSearchChange("")
    }] : []),
  ];

  /* Shared props for SidebarFilters */
  const sidebarProps = {
    search, onSearchChange: handleSearchChange,
    draftCategories, onToggleCategory: handleToggleCategory,
    draftPriceMin, onPriceMinChange: setDraftPriceMin,
    draftPriceMax, onPriceMaxChange: setDraftPriceMax,
    draftInStock, onInStockChange: setDraftInStock,
    meta, hasPending, onApply: applyFilters, onClearAll: clearAll, chips,
  };

  /* Ellipsis pagination */
  const buildPageList = () => {
    const delta = 2, list = [];
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= page - delta && i <= page + delta)) list.push(i);
      else if (list[list.length - 1] !== "…") list.push("…");
    }
    return list;
  };

  /* ─── Render ──────────────────────────────────────────────── */
  return (
    <div className="mt-10 pb-16">
      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">All Products</h1>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-4 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="mb-1">
              <p className="font-semibold text-gray-800">Filters</p>
            </div>
            <SidebarFilters {...sidebarProps} />
          </div>
        </aside>

        {/* Right panel */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <button onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 cursor-pointer transition-colors">
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8}>
                <path d="M3 5h14M6 10h8M9 15h2" strokeLinecap="round" />
              </svg>
              Filters
              {chips.length > 0 && (
                <span className="bg-indigo-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {chips.length}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3 ml-auto">
              {!loading && (
                <p className="text-sm text-gray-400 hidden sm:block">
                  {total} product{total !== 1 ? "s" : ""}
                </p>
              )}
              <select value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 cursor-pointer bg-white transition-colors">
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Active chips */}
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {chips.map((chip) => (
                <span key={chip.key}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {chip.label}
                  <button onClick={chip.remove} className="hover:text-red-500 cursor-pointer transition-colors">
                    <CloseX />
                  </button>
                </span>
              ))}
              <button onClick={clearAll}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 cursor-pointer transition-colors">
                Clear all
              </button>
            </div>
          )}

          {/* Pending banner - removed as filters apply immediately */}

          {/* Grid */}
          {loading ? (
            <ProductSkeletonGrid count={12} />
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
              <svg viewBox="0 0 64 64" className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <circle cx="28" cy="28" r="18" />
                <path d="m42 42 12 12" strokeLinecap="round" />
              </svg>
              <p className="text-lg font-medium mb-1">
                {search ? `Product with the name "${search}" is not available right now` : "No products found"}
              </p>
              <p className="text-sm mb-4">
                {search ? "Try searching with different keywords" : "Try adjusting your search or filters"}
              </p>
              <button onClick={clearAll}
                className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 cursor-pointer transition-colors text-sm font-medium">
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>

              {pages > 1 && (
                <div className="flex items-center justify-between mt-10 flex-wrap gap-3">
                  <p className="text-sm text-gray-400">Page {page} of {pages} · {total} results</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 cursor-pointer transition-colors text-sm">
                      ← Prev
                    </button>
                    {buildPageList().map((p, idx) =>
                      p === "…" ? (
                        <span key={`e${idx}`} className="px-2 text-gray-400 text-sm">…</span>
                      ) : (
                        <button key={p} onClick={() => setPage(p)}
                          className={`w-9 h-9 rounded-lg border text-sm cursor-pointer transition-colors font-medium ${p === page ? "bg-indigo-500 text-white border-indigo-500" : "border-gray-300 hover:bg-gray-50 text-gray-600"
                            }`}>
                          {p}
                        </button>
                      )
                    )}
                    <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 cursor-pointer transition-colors text-sm">
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile backdrop */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setDrawerOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-50 shadow-2xl transition-transform duration-300 lg:hidden flex flex-col ${drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-800">Filters</p>
          </div>
          <button onClick={() => setDrawerOpen(false)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded">
            <CloseX className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          <SidebarFilters {...sidebarProps} />
        </div>
        <div className="p-5 border-t border-gray-100">
          <button onClick={() => setDrawerOpen(false)}
            className="w-full py-3 font-medium rounded-lg cursor-pointer transition-colors text-sm bg-indigo-500 hover:bg-indigo-600 text-white">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

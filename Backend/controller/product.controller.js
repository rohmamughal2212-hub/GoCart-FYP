import Product from "../models/product.model.js";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "grocery-app/products" },
      (err, result) => (err ? reject(err) : resolve(result.secure_url)),
    );
    stream.end(buffer);
  });

const generateStableId = (value) =>
  crypto.createHash("md5").update(String(value)).digest("hex").slice(0, 24);

const loadLocalProductsWithIds = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const localPath = path.join(__dirname, "..", "data", "localProducts.json");
  if (!fs.existsSync(localPath)) return [];
  const raw = fs.readFileSync(localPath, "utf8");
  const localProducts = JSON.parse(raw);
  return localProducts.map((product) => ({
    ...product,
    _id:
      product._id ||
      generateStableId(`${product.category}|${product.name}|${product.price}|${product.offerPrice}`),
  }));
};

const loadFallbackProductsWithIds = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const fallbackPath = path.join(__dirname, "..", "data", "fallbackDb.json");
  if (!fs.existsSync(fallbackPath)) return [];
  const raw = fs.readFileSync(fallbackPath, "utf8");
  const fallbackData = JSON.parse(raw);
  const fallbackProducts = Array.isArray(fallbackData.products) ? fallbackData.products : [];
  return fallbackProducts.map((product) => ({
    ...product,
    _id:
      product._id ||
      product.id ||
      generateStableId(`${product.category}|${product.name}|${product.price}|${product.offerPrice}`),
  }));
};

// PUT /api/product/:id
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = {};
    const allowedFields = [
      "name",
      "description",
      "price",
      "offerPrice",
      "category",
      "inStock",
      "stock",
      "freeDelivery",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateFields[field] = req.body[field];
    });

    if (req.body.stock !== undefined) {
      const stockValue = Number(req.body.stock);
      updateFields.stock = Number.isNaN(stockValue) ? 0 : Math.max(0, Math.floor(stockValue));
      updateFields.inStock = updateFields.stock > 0;
    }
    if (req.body.inStock !== undefined && req.body.stock === undefined) {
      updateFields.inStock = req.body.inStock;
    }

    // Handle image update if files are provided
    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map((f) => uploadToCloudinary(f.buffer)),
      );
      updateFields.image = imageUrls;
    }

    const product = await Product.findByIdAndUpdate(id, updateFields, {
      new: true,
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res
      .status(200)
      .json({
        success: true,
        product,
        message: "Product updated successfully",
      });
  } catch (error) {
    console.error("updateProduct error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update product",
        error: error.message,
      });
  }
};

// POST /api/product/add-product
export const addProduct = async (req, res) => {
  try {
    const { name, price, offerPrice, description, category, stock } = req.body;

    if (!name || !price || !offerPrice || !description || !category)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    if (Number(price) <= 0 || Number(offerPrice) <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Price must be a positive number" });
    if (!req.files || req.files.length === 0)
      return res
        .status(400)
        .json({
          success: false,
          message: "At least one product image is required",
        });

    const imageUrls = await Promise.all(
      req.files.map((f) => uploadToCloudinary(f.buffer)),
    );

    const stockValue = Number(stock);
    const product = await Product.create({
      name,
      description,
      category,
      price: Number(price),
      offerPrice: Number(offerPrice),
      stock: Number.isNaN(stockValue) ? 0 : Math.max(0, Math.floor(stockValue)),
      inStock: Number.isNaN(stockValue) ? false : stockValue > 0,
      image: imageUrls,
    });

    return res
      .status(201)
      .json({ success: true, product, message: "Product added successfully" });
  } catch (error) {
    console.error("addProduct error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to add product",
        error: error.message,
      });
  }
};

// GET /api/product/list
// Query params:
//   search      – text match on name (case-insensitive)
//   categories  – comma-separated list, e.g. "Grocery,Meat"
//   minPrice    – minimum offerPrice
//   maxPrice    – maximum offerPrice
//   inStock     – "true" to show only in-stock items
//   sort        – featured | price_asc | price_desc | name_asc | newest
//   page        – page number (default 1)
//   limit       – items per page (default 12; pass 0 for all)
const CATEGORY_ALIASES = {
  Electronics: ["electronics"],
  Sports: ["sports"],
  Grocery: ["grocery"],
  Meat: ["meat"],
  Beauty: ["beauty", "beauty and care"],
  Kitchen: ["kitchen", "home", "home and kitchen"],
  Garments: ["garments", "fashion"],
  "Baby Items": ["baby", "baby items", "baby care"],
  Computers: ["computers", "computer"],
  Books: ["books"],
  Toys: ["toys", "toys and games"],
};

const normalizeCategoryText = (value = "") => String(value ?? "")
  .trim()
  .toLowerCase()
  .replace(/[_-]+/g, " ")
  .replace(/&/g, " and ")
  .replace(/\s+/g, " ")
  .trim();

const APPROVED_PUBLIC_CATEGORIES = Object.keys(CATEGORY_ALIASES);

const categoryMatches = (productCategory, categoryKey) => {
  const productValue = normalizeCategoryText(productCategory);
  const selectedValue = normalizeCategoryText(categoryKey);

  if (!productValue || !selectedValue) return false;
  if (productValue === selectedValue || productValue.includes(selectedValue) || selectedValue.includes(productValue)) {
    return true;
  }

  const categoryAliasMap = Object.entries(CATEGORY_ALIASES);
  const canonicalTarget = categoryAliasMap.find(([canonicalName, aliases]) => {
    const aliasSet = new Set(aliases.map((alias) => normalizeCategoryText(alias)));
    return aliasSet.has(selectedValue) || normalizeCategoryText(canonicalName) === selectedValue;
  });

  if (!canonicalTarget) return false;
  const canonicalAliases = new Set(canonicalTarget[1].map((alias) => normalizeCategoryText(alias)));
  canonicalAliases.add(normalizeCategoryText(canonicalTarget[0]));
  return canonicalAliases.has(productValue);
};

const normalizeProductPayload = (product) => {
  if (!product) return product;

  const raw = product._doc && typeof product._doc === "object" ? product._doc : product;
  const plain = product.toObject && typeof product.toObject === "function" ? product.toObject() : raw;
  const price = Number(plain.price ?? raw.price ?? 0);
  const offerPrice = Number(plain.offerPrice ?? raw.offerPrice ?? plain.price ?? raw.price ?? 0);
  const stock = Number(plain.stock ?? raw.stock ?? 0);

  return {
    ...plain,
    ...raw,
    _id: plain._id || raw._id || plain.id || raw.id,
    price,
    offerPrice,
    stock,
    inStock: plain.inStock !== undefined ? Boolean(plain.inStock) : raw.inStock !== undefined ? Boolean(raw.inStock) : stock > 0,
  };
};

const isApprovedPublicCategory = (productCategory) => {
  const categoryValue = String(productCategory || "").trim();
  if (!categoryValue) return false;

  return APPROVED_PUBLIC_CATEGORIES.some((category) => categoryMatches(categoryValue, category));
};

const sanitizePublicCatalog = (products = []) => {
  const seen = new Set();
  const approved = [];

  for (const product of products) {
    const category = String(product?.category || "").trim();
    const name = String(product?.name || product?.title || "").trim();

    if (!category || !name || !isApprovedPublicCategory(category)) continue;

    const identity = `${category.toLowerCase()}|${name.toLowerCase()}`;
    if (seen.has(identity)) continue;

    seen.add(identity);
    approved.push(product);
  }

  return approved.slice(0, 42);
};

export const getProducts = async (req, res) => {
  try {
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    const {
      search,
      categories,
      minPrice,
      maxPrice,
      inStock,
      sort = "featured",
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Public storefront should only show the approved category list and the cleaned catalog.
    const selectedCategories = (categories || String(APPROVED_PUBLIC_CATEGORIES.join(","))).split(",").map((value) => value.trim()).filter(Boolean);
    const filteredCategories = selectedCategories.length ? selectedCategories : APPROVED_PUBLIC_CATEGORIES;
    if (!categories || !categories.trim()) {
      query.category = {
        $in: filteredCategories.map((value) => new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")),
      };
    }

    // Text search
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    // Multi-category filter (case-insensitive)
    if (categories && categories.trim()) {
      const catArray = categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
        .map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
      if (catArray.length) {
        query.category = {
          $in: catArray.map((cat) => new RegExp(cat, "i")),
        };
      }
    }

    // Price range
    if (minPrice || maxPrice) {
      query.offerPrice = {};
      if (minPrice) query.offerPrice.$gte = Number(minPrice);
      if (maxPrice) query.offerPrice.$lte = Number(maxPrice);
    }

    // Stock: a product is available only when both the flag and quantity agree.
    if (inStock === "true") {
      query.inStock = true;
      query.stock = { $gt: 0 };
    }

    // Sort
    const sortMap = {
      featured: { createdAt: -1 },
      price_asc: { offerPrice: 1 },
      price_desc: { offerPrice: -1 },
      name_asc: { name: 1 },
      newest: { _id: -1 },
    };
    const sortObj = sortMap[sort] || sortMap.featured;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    let productsFromDb = [];
    let total = 0;
    try {
      [productsFromDb, total] = await Promise.all([
        limitNum === 0
          ? Product.find(query).sort(sortObj)
          : Product.find(query).sort(sortObj).skip(skip).limit(limitNum),
        Product.countDocuments(query),
      ]);
    } catch (databaseError) {
      console.warn("Product database query failed; using fallback products:", databaseError.message);
    }

    const buildProductIdentity = (product = {}) => {
      const category = String(product.category || "Uncategorized").trim().toLowerCase();
      const name = String(product.name || product.title || "Untitled Product").trim().toLowerCase();
      return `${category}|${name}`;
    };

    const productVersionScore = (product = {}) => {
      const stockValue = Number(product.stock ?? (product.inStock ? 1 : 0) ?? 0);
      const updatedAt = Date.parse(product.updatedAt || product.createdAt || "1970-01-01T00:00:00.000Z");
      const priceValue = Number(product.offerPrice ?? product.price ?? 0);
      const imageValue = Array.isArray(product.image) && product.image.length > 0 ? 1 : 0;
      return ((Number.isFinite(updatedAt) ? updatedAt : 0) * 10) + (stockValue * 1000) + (priceValue * 0.01) + imageValue;
    };

    const dedupeProducts = (items = []) => {
      const unique = new Map();

      items.forEach((product) => {
        const normalized = {
          ...product,
          _id: product._id || product.id || `${product.name || "untitled"}|${product.category || "uncategorized"}|${product.price || 0}|${product.offerPrice || 0}`,
          category: product.category || "Uncategorized",
          name: product.name || product.title || "Untitled Product",
        };

        const key = buildProductIdentity(normalized);
        const existing = unique.get(key);

        if (!existing) {
          unique.set(key, normalized);
          return;
        }

        if (productVersionScore(normalized) > productVersionScore(existing)) {
          unique.set(key, normalized);
        }
      });

      return [...unique.values()];
    };

    const selectedCategoryFilters = (categories || "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    const filterProductsBySelectedCategories = (items = []) => {
      if (!selectedCategoryFilters.length) return items;
      return items.filter((product) => {
        const productCategory = String(product.category || "").toLowerCase();
        return selectedCategoryFilters.some((category) => productCategory.includes(category));
      });
    };

    const normalizeProductImage = (product, fallbackProducts = []) => {
      const currentImage = Array.isArray(product?.image) ? product.image : [];
      if (currentImage.length > 0) return currentImage;

      if (!fallbackProducts.length) return currentImage;

      const exactMatch = fallbackProducts.find((item) => {
        const sameName = (item.name || "").trim().toLowerCase() === (product.name || "").trim().toLowerCase();
        const sameCategory = (item.category || "").trim().toLowerCase() === (product.category || "").trim().toLowerCase();
        return sameName && sameCategory;
      });

      if (exactMatch && Array.isArray(exactMatch.image) && exactMatch.image.length > 0) {
        return exactMatch.image;
      }

      const samePriceMatch = fallbackProducts.find((item) => {
        const sameCategory = (item.category || "").trim().toLowerCase() === (product.category || "").trim().toLowerCase();
        const samePrice = Number(item.offerPrice ?? item.price ?? 0) === Number(product.offerPrice ?? product.price ?? 0);
        return sameCategory && samePrice;
      });

      if (samePriceMatch && Array.isArray(samePriceMatch.image) && samePriceMatch.image.length > 0) {
        return samePriceMatch.image;
      }

      return currentImage;
    };

    const canonicalCatalog = dedupeProducts([
      ...loadFallbackProductsWithIds(),
      ...loadLocalProductsWithIds(),
    ]);
    const enrichProductsWithImage = (items = []) => items.map((product) => ({
      ...product,
      image: normalizeProductImage(product, canonicalCatalog),
    }));

    if (total && total > 0) {
      const fallbackProducts = dedupeProducts(filterProductsBySelectedCategories(canonicalCatalog));
      const dbProducts = dedupeProducts(filterProductsBySelectedCategories(productsFromDb || []));
      const dbIds = new Set(dbProducts.map((product) => buildProductIdentity(product)));
      const extraFallbackProducts = fallbackProducts.filter(
        (product) => !dbIds.has(buildProductIdentity(product)),
      );

      const merged = enrichProductsWithImage(dedupeProducts([...dbProducts, ...extraFallbackProducts]));
      const publicCatalog = sanitizePublicCatalog(merged).filter((product) => product && isApprovedPublicCategory(product.category));
      const totalMerged = publicCatalog.length;
      const pagedMerged = limitNum === 0 ? publicCatalog : publicCatalog.slice(skip, skip + limitNum);
      const safeProducts = pagedMerged.map(normalizeProductPayload);

      return res.status(200).json({
        success: true,
        products: safeProducts,
        total: totalMerged,
        page: pageNum,
        pages: limitNum === 0 ? 1 : Math.ceil(totalMerged / limitNum),
      });
    }

    // Fallback: load persisted fallback products when DB is unavailable
    let filtered = loadFallbackProductsWithIds();
    if (filtered.length === 0) {
      filtered = loadLocalProductsWithIds();
    }
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(s));
    }
    if (categories && categories.trim()) {
      const catArray = categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
        .map((c) => c.toLowerCase());
      // match if any category token is a substring of product category
      filtered = filtered.filter((p) =>
        catArray.some((cat) => p.category.toLowerCase().includes(cat)),
      );
    }
    if (minPrice || maxPrice) {
      filtered = filtered.filter((p) => {
        const v = Number(p.offerPrice || p.price || 0);
        if (minPrice && v < Number(minPrice)) return false;
        if (maxPrice && v > Number(maxPrice)) return false;
        return true;
      });
    }
    if (inStock === "true") {
      filtered = filtered.filter((p) => p.inStock === true && Number(p.stock) > 0);
    }

    // Sorting
    const sortFuncs = {
      featured: (a, b) => 0,
      price_asc: (a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price),
      price_desc: (a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price),
      name_asc: (a, b) => a.name.localeCompare(b.name),
      newest: (a, b) => 0,
    };
    const sortFn = sortFuncs[sort] || sortFuncs.featured;
    filtered = filtered.slice().sort(sortFn);

    filtered = dedupeProducts(filtered);
    const publicCatalog = sanitizePublicCatalog(filtered).filter((product) => product && isApprovedPublicCategory(product.category));
    const totalLocal = publicCatalog.length;
    const pages = limitNum === 0 ? 1 : Math.ceil(totalLocal / limitNum);
    const paged = enrichProductsWithImage(limitNum === 0 ? publicCatalog : publicCatalog.slice(skip, skip + limitNum));
    const safeProducts = paged.map(normalizeProductPayload);

    return res.status(200).json({
      success: true,
      products: safeProducts,
      total: totalLocal,
      page: pageNum,
      pages,
    });
  } catch (error) {
    console.error("getProducts error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch products",
        error: error.message,
      });
  }
};

// GET /api/product/meta
// Returns min/max offerPrice and per-category counts (total + inStock)
export const getProductMeta = async (req, res) => {
  try {
    const [priceAgg, catAgg] = await Promise.all([
      Product.aggregate([
        {
          $group: {
            _id: null,
            minPrice: { $min: "$offerPrice" },
            maxPrice: { $max: "$offerPrice" },
          },
        },
      ]),
      Product.aggregate([
        {
          $group: {
            _id: "$category",
            total: { $sum: 1 },
            inStock: { $sum: { $cond: [{ $and: ["$inStock", { $gt: ["$stock", 0] }] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    let minPrice = (priceAgg[0] && priceAgg[0].minPrice) || 0;
    let maxPrice = (priceAgg[0] && priceAgg[0].maxPrice) || 1000;
    const categoryCounts = {};
    catAgg.forEach(({ _id, total, inStock }) => {
      categoryCounts[_id] = { total, inStock };
    });

    // If DB has no categories, fallback to persisted fallback products or the local product file
    if (Object.keys(categoryCounts).length === 0) {
      let local = loadFallbackProductsWithIds();
      if (local.length === 0) {
        local = loadLocalProductsWithIds();
      }
      if (local.length) {
        const offers = local.map((p) => Number(p.offerPrice || p.price || 0));
        minPrice = Math.min(...offers);
        maxPrice = Math.max(...offers);
        local.forEach((p) => {
          const cat = p.category;
          categoryCounts[cat] = categoryCounts[cat] || { total: 0, inStock: 0 };
          categoryCounts[cat].total += 1;
          if (p.inStock === true && Number(p.stock) > 0) categoryCounts[cat].inStock += 1;
        });
      }
    }

    res.status(200).json({ success: true, minPrice, maxPrice, categoryCounts });
  } catch (error) {
    console.error("getProductMeta error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch product meta",
        error: error.message,
      });
  }
};

// GET /api/product/id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.body;
    let product = null;

    try {
      product = await Product.findById(id);
    } catch {
      product = null;
    }

    if (!product) {
      let localProducts = loadFallbackProductsWithIds();
      if (localProducts.length === 0) {
        localProducts = loadLocalProductsWithIds();
      }
      product = localProducts.find((p) => p._id === id);
    }

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product: normalizeProductPayload(product) });
  } catch (error) {
    console.error("getProductById error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch product",
        error: error.message,
      });
  }
};

// POST /api/product/stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    const product = await Product.findByIdAndUpdate(
      id,
      { inStock },
      { new: true },
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product, message: "Stock updated" });
  } catch (error) {
    console.error("changeStock error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update stock",
        error: error.message,
      });
  }
};

// DELETE /api/product/delete-by-name (temporary for cleaning)
export const deleteProductByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ success: false, message: "Name parameter required" });
    }
    const result = await Product.deleteOne({ name });
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} product(s)`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("deleteProductByName error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};


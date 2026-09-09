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
//   categories  – comma-separated list, e.g. "Vegetables,Fruits"
//   minPrice    – minimum offerPrice
//   maxPrice    – maximum offerPrice
//   inStock     – "true" to show only in-stock items
//   sort        – featured | price_asc | price_desc | name_asc | newest
//   page        – page number (default 1)
//   limit       – items per page (default 12; pass 0 for all)
export const getProducts = async (req, res) => {
  try {
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

    // Text search
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    // Multi-category filter (case-insensitive)
    if (categories && categories.trim()) {
      const catArray = categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      if (catArray.length) {
        // Use substring, case-insensitive match so 'Baby' matches 'Baby Items'
        query.category = {
          $in: catArray.map((cat) => new RegExp(`${cat}`, "i")),
        };
      }
    }

    // Price range
    if (minPrice || maxPrice) {
      query.offerPrice = {};
      if (minPrice) query.offerPrice.$gte = Number(minPrice);
      if (maxPrice) query.offerPrice.$lte = Number(maxPrice);
    }

    // Stock
    if (inStock === "true") query.inStock = true;

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

    const [productsFromDb, total] = await Promise.all([
      limitNum === 0
        ? Product.find(query).sort(sortObj)
        : Product.find(query).sort(sortObj).skip(skip).limit(limitNum),
      Product.countDocuments(query),
    ]);

    // If DB returned results, use them
    if (total && total > 0) {
      return res.status(200).json({
        success: true,
        products: productsFromDb,
        total,
        page: pageNum,
        pages: limitNum === 0 ? 1 : Math.ceil(total / limitNum),
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
    if (inStock === "true") filtered = filtered.filter((p) => p.inStock);

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

    const totalLocal = filtered.length;
    const pages = limitNum === 0 ? 1 : Math.ceil(totalLocal / limitNum);
    const paged = limitNum === 0 ? filtered : filtered.slice(skip, skip + limitNum);

    return res.status(200).json({
      success: true,
      products: paged,
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
            inStock: { $sum: { $cond: ["$inStock", 1, 0] } },
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
          if (p.inStock) categoryCounts[cat].inStock += 1;
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
    res.status(200).json({ success: true, product });
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


import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const fallbackDb = {
  users: [],
  products: [],
  addresses: [],
  orders: [],
  reviews: [],
  newsletters: [],
  nextId: 1,
};

const FALLBACK_DB_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "fallbackDb.json");

const normalizeEmail = (email) => (email || "").toLowerCase().trim();

const loadFallbackDb = () => {
  try {
    if (!fs.existsSync(FALLBACK_DB_PATH)) return;
    const raw = fs.readFileSync(FALLBACK_DB_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      fallbackDb.users = Array.isArray(parsed.users) ? parsed.users : [];
      fallbackDb.products = Array.isArray(parsed.products) ? parsed.products : [];
      fallbackDb.addresses = Array.isArray(parsed.addresses) ? parsed.addresses : [];
      fallbackDb.orders = Array.isArray(parsed.orders) ? parsed.orders : [];
      fallbackDb.reviews = Array.isArray(parsed.reviews) ? parsed.reviews : [];
      fallbackDb.newsletters = Array.isArray(parsed.newsletters) ? parsed.newsletters : [];
      fallbackDb.nextId = Number(parsed.nextId) || fallbackDb.nextId;
    }
  } catch (error) {
    console.warn("Could not load fallback DB file:", error.message);
  }
};

const saveFallbackDb = () => {
  try {
    const payload = {
      users: fallbackDb.users,
      products: fallbackDb.products,
      addresses: fallbackDb.addresses,
      orders: fallbackDb.orders,
      reviews: fallbackDb.reviews,
      newsletters: fallbackDb.newsletters,
      nextId: fallbackDb.nextId,
    };
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(payload, null, 2), "utf8");
  } catch (error) {
    console.warn("Could not persist fallback DB file:", error.message);
  }
};

loadFallbackDb();

const extractStringField = (text, field) => {
  const match = text.match(new RegExp(`${field}\\s*:\\s*['\"]([^'\"]+)['\"]`));
  return match ? match[1] : undefined;
};

const extractNumberField = (text, field) => {
  const match = text.match(new RegExp(`${field}\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)`));
  return match ? Number(match[1]) : 0;
};

const extractBooleanField = (text, field, defaultValue = true) => {
  const match = text.match(new RegExp(`${field}\\s*:\\s*(true|false)`));
  return match ? match[1] === "true" : defaultValue;
};

const extractImageField = (text) => {
  // Try to match image: [ ... ]
  const imageMatch = text.match(/image\s*:\s*\[\s*([^\]]+)\s*\]/);
  if (!imageMatch) {
    return [];
  }

  const imageContent = imageMatch[1].trim();
  const images = [];

  // Split by comma and process each item
  const items = imageContent.split(',').map(s => s.trim());
  for (const item of items) {
    if (!item) continue;

    // If it's a string literal like "/images/file.png" or 'file.png'
    const stringMatch = item.match(/^['"](.*?)['"]$/);
    if (stringMatch) {
      images.push(stringMatch[1]);
      continue;
    }

    // If it's a variable reference (can contain hyphens and underscores)
    if (/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(item)) {
      images.push(`/images/${item}.png`);
      continue;
    }
  }

  return images.length > 0 ? images : [];
};

const loadFrontendProducts = () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const frontendPath = path.join(__dirname, "..", "..", "Frontend", "src", "assets", "assets.js");
    if (!fs.existsSync(frontendPath)) return [];
    const raw = fs.readFileSync(frontendPath, "utf8");
    const products = [];
    const sectionRegex = /export const\s+(electronicsProducts|dummyProducts)\s*=\s*\[([\s\S]*?)\];/g;
    let sectionMatch;
    while ((sectionMatch = sectionRegex.exec(raw)) !== null) {
      const sectionName = sectionMatch[1];
      const sectionBody = sectionMatch[2];

      // Parse objects by matching braces properly
      let i = 0;
      while (i < sectionBody.length) {
        const openIdx = sectionBody.indexOf('{', i);
        if (openIdx === -1) break;

        // Find the matching closing brace
        let braceCount = 1;
        let closeIdx = openIdx + 1;
        while (closeIdx < sectionBody.length && braceCount > 0) {
          if (sectionBody[closeIdx] === '{') braceCount++;
          else if (sectionBody[closeIdx] === '}') braceCount--;
          closeIdx++;
        }

        if (braceCount === 0) {
          const objText = sectionBody.substring(openIdx + 1, closeIdx - 1);
          const id = extractStringField(objText, "_id") || extractStringField(objText, "id");
          if (id) {
            const name = extractStringField(objText, "name") || "Unknown Product";
            const category = extractStringField(objText, "category") || "Misc";
            const price = extractNumberField(objText, "price");
            const offerPrice = extractNumberField(objText, "offerPrice");
            const inStock = extractBooleanField(objText, "inStock", true);
            let image = extractImageField(objText);

            // If no image extracted, generate from product name
            if (image.length === 0) {
              const nameKebab = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              image = [`/images/${nameKebab}.png`];
            }

            products.push({ _id: id, name, category, price, offerPrice, inStock, image, description: [] });
          }
          i = closeIdx;
        } else {
          break;
        }
      }
    }
    return products;
  } catch (error) {
    console.warn("Could not load frontend products for fallback:", error.message);
    return [];
  }
};

const loadLocalProductsWithIds = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const localPath = path.join(__dirname, "..", "data", "localProducts.json");
  const localProducts = fs.existsSync(localPath)
    ? JSON.parse(fs.readFileSync(localPath, "utf8"))
    : [];
  const frontendProducts = loadFrontendProducts();

  const mergedById = new Map();
  for (const product of localProducts) {
    const id =
      product._id ||
      crypto
        .createHash("md5")
        .update(`${product.category}|${product.name}|${product.price}|${product.offerPrice}`)
        .digest("hex")
        .slice(0, 24);
    mergedById.set(String(id), { ...product, _id: String(id) });
  }
  for (const product of frontendProducts) {
    const id = String(product._id);
    if (!mergedById.has(id)) {
      mergedById.set(id, product);
    }
  }

  return Array.from(mergedById.values());
};

const createFallbackUserDoc = (doc) => {
  const user = {
    _id: String(fallbackDb.nextId++),
    name: doc.name || "",
    email: normalizeEmail(doc.email || ""),
    password: doc.password || "",
    phone: doc.phone || "",
    profileImage: (doc.profileImage && doc.profileImage.trim()) ? doc.profileImage : "",
    cartItems: doc.cartItems || {},
    wishlist: Array.isArray(doc.wishlist) ? doc.wishlist : [],
    resetPasswordToken: doc.resetPasswordToken,
    resetPasswordExpire: doc.resetPasswordExpire ? new Date(doc.resetPasswordExpire) : undefined,
    otp: doc.otp,
    otpExpire: doc.otpExpire ? new Date(doc.otpExpire) : undefined,
    isVerified: doc.isVerified ?? false,
  };
  user.save = async function () {
    const saved = await saveFallbackUser(this);
    saveFallbackDb();
    return saved;
  };
  return user;
};

const findFallbackUser = async (query) => {
  let user;
  if (query && query.$or) {
    user = fallbackDb.users.find((candidate) => {
      const matches = query.$or.some((rule) => {
        if (rule.resetPasswordToken && rule.resetPasswordExpire && rule.resetPasswordExpire.$gt) {
          const now = Number(rule.resetPasswordExpire.$gt);
          const tokenMatches = candidate.resetPasswordToken === rule.resetPasswordToken || candidate.resetPasswordToken === crypto.createHash("sha256").update(rule.resetPasswordToken).digest("hex");
          const expiresAt = new Date(candidate.resetPasswordExpire).getTime();
          return tokenMatches && Number.isFinite(expiresAt) && expiresAt > now;
        }
        return false;
      });
      return matches;
    });
  } else if (query.email) {
    const normalized = normalizeEmail(query.email);
    user = fallbackDb.users.find((u) => u.email === normalized);
  } else if (query._id) {
    user = fallbackDb.users.find((u) => u._id === String(query._id));
  } else if (query.resetPasswordToken && query.resetPasswordExpire && query.resetPasswordExpire.$gt) {
    const now = Number(query.resetPasswordExpire.$gt);
    user = fallbackDb.users.find((u) => {
      const tokenMatches = u.resetPasswordToken === query.resetPasswordToken || u.resetPasswordToken === crypto.createHash("sha256").update(query.resetPasswordToken).digest("hex");
      const expiresAt = new Date(u.resetPasswordExpire).getTime();
      return tokenMatches && Number.isFinite(expiresAt) && expiresAt > now;
    });
  }

  if (user) {
    // Ensure all required fields exist
    if (user.profileImage === undefined || user.profileImage === null) user.profileImage = "";
    if (!user.cartItems) user.cartItems = {};
    if (!Array.isArray(user.wishlist)) user.wishlist = [];
    if (!user.save) {
      user.save = async function () {
        const saved = await saveFallbackUser(this);
        saveFallbackDb();
        return saved;
      };
    }
  }
  return user;
};

const findFallbackUserById = async (id) => {
  const user = fallbackDb.users.find((u) => u._id === String(id));
  if (user) {
    // Ensure all fields exist on user object
    if (user.profileImage === undefined || user.profileImage === null) user.profileImage = "";
    if (!user.cartItems) user.cartItems = {};
    if (!Array.isArray(user.wishlist)) user.wishlist = [];
    if (!user.save) {
      user.save = async function () {
        const saved = await saveFallbackUser(this);
        saveFallbackDb();
        return saved;
      };
    }
  }
  return user;
};

const saveFallbackUser = async (user) => {
  const index = fallbackDb.users.findIndex((u) => u._id === String(user._id));
  const updatedUser = {
    _id: String(user._id),
    name: user.name || "",
    email: user.email || "",
    password: user.password || "",
    phone: user.phone || "",
    profileImage: (user.profileImage && user.profileImage.trim()) ? user.profileImage : "",
    cartItems: user.cartItems || {},
    wishlist: Array.isArray(user.wishlist) ? user.wishlist : [],
    resetPasswordToken: user.resetPasswordToken,
    resetPasswordExpire: user.resetPasswordExpire ? new Date(user.resetPasswordExpire) : undefined,
    otp: user.otp,
    otpExpire: user.otpExpire ? new Date(user.otpExpire) : undefined,
    isVerified: user.isVerified ?? false,
  };

  // Reattach the save method
  updatedUser.save = async function () {
    const saved = await saveFallbackUser(this);
    saveFallbackDb();
    return saved;
  };

  if (index !== -1) {
    fallbackDb.users[index] = updatedUser;
  } else {
    fallbackDb.users.push(updatedUser);
  }
  saveFallbackDb();
  return updatedUser;
};

const createFallbackUser = async (doc) => {
  const newUser = createFallbackUserDoc(doc);
  fallbackDb.users.push(newUser);
  saveFallbackDb();
  return newUser;
};

const createFallbackNewsletterDoc = (doc) => {
  return {
    _id: String(fallbackDb.nextId++),
    email: normalizeEmail(doc.email || ""),
  };
};

const findFallbackNewsletter = async (query) => {
  if (!query || !query.email) return null;
  const normalized = normalizeEmail(query.email);
  return fallbackDb.newsletters.find((item) => item.email === normalized) || null;
};

const createFallbackNewsletter = async (doc) => {
  const newNewsletter = createFallbackNewsletterDoc(doc);
  fallbackDb.newsletters.push(newNewsletter);
  saveFallbackDb();
  return newNewsletter;
};

const updateFallbackNewsletter = async (query, update) => {
  const newsletter = await findFallbackNewsletter(query);
  if (!newsletter) return null;
  Object.assign(newsletter, {
    email: normalizeEmail(update.email || newsletter.email),
  });
  saveFallbackDb();
  return newsletter;
};

const findProductsFallback = (query) => {
  // Reload fallback DB from disk each time so external updates are reflected immediately.
  loadFallbackDb();
  if (fallbackDb.products.length === 0) {
    fallbackDb.products = loadLocalProductsWithIds();
  }
  if (!query || Object.keys(query).length === 0) {
    return fallbackDb.products;
  }
  if (query._id) {
    return fallbackDb.products.find((product) => String(product._id) === String(query._id)) || null;
  }
  return fallbackDb.products.filter((product) => matchesQuery(product, query));
};

const findProductByIdFallback = (id) => {
  // First try existing loaded fallback products
  let found = findProductsFallback({ _id: id }) || null;
  if (found) return found;

  // If not found, attempt to load frontend/local products and search there
  try {
    const frontendProducts = loadLocalProductsWithIds();
    const byId = frontendProducts.find((p) => String(p._id) === String(id));
    if (byId) return byId;
  } catch (e) {
    // ignore errors
  }

  return null;
};

const decrementProductStockFallback = (id, quantity) => {
  loadFallbackDb();
  let product = fallbackDb.products.find((item) => String(item._id || item.id) === String(id));
  if (!product) {
    product = findProductByIdFallback(id);
    if (product) fallbackDb.products.push(product);
  }
  if (!product) return null;

  const currentStock = Number.isFinite(Number(product.stock))
    ? Number(product.stock)
    : product.inStock ? 1 : 0;
  if (currentStock < quantity) return undefined;

  const updatedProduct = {
    ...product,
    stock: currentStock - quantity,
    inStock: currentStock - quantity > 0,
    updatedAt: new Date().toISOString(),
  };
  const index = fallbackDb.products.findIndex((item) => String(item._id || item.id) === String(id));
  if (index === -1) fallbackDb.products.push(updatedProduct);
  else fallbackDb.products[index] = updatedProduct;
  saveFallbackDb();
  return updatedProduct;
};

const aggregateProductsFallback = (pipeline = []) => {
  const products = findProductsFallback();
  if (!Array.isArray(pipeline) || pipeline.length === 0) return [];

  const stage = pipeline[0];
  if (stage.$group) {
    const groupId = stage.$group._id;
    if (groupId === null) {
      const result = {};
      if (stage.$group.minPrice && stage.$group.minPrice.$min === "$offerPrice") {
        result.minPrice = products.reduce((min, p) => Math.min(min, Number(p.offerPrice || p.price || 0)), Infinity);
      }
      if (stage.$group.maxPrice && stage.$group.maxPrice.$max === "$offerPrice") {
        result.maxPrice = products.reduce((max, p) => Math.max(max, Number(p.offerPrice || p.price || 0)), -Infinity);
      }
      return [{ _id: null, minPrice: Number.isFinite(result.minPrice) ? result.minPrice : 0, maxPrice: Number.isFinite(result.maxPrice) ? result.maxPrice : 0 }];
    }
    if (groupId === "$category") {
      const counts = products.reduce((acc, p) => {
        const category = p.category || "Unknown";
        acc[category] = acc[category] || { total: 0, inStock: 0 };
        acc[category].total += 1;
        if (p.inStock) acc[category].inStock += 1;
        return acc;
      }, {});
      let result = Object.entries(counts).map(([category, values]) => ({ _id: category, total: values.total, inStock: values.inStock }));
      const sortStage = pipeline.find((stageItem) => stageItem.$sort);
      if (sortStage && sortStage.$sort && sortStage.$sort._id) {
        const direction = sortStage.$sort._id;
        result = result.sort((a, b) => (a._id > b._id ? direction : a._id < b._id ? -direction : 0));
      }
      return result;
    }
  }
  return [];
};

const createFallbackAddressDoc = (doc) => {
  const address = {
    _id: String(fallbackDb.nextId++),
    userId: String(doc.userId || ""),
    firstName: doc.firstName || "",
    lastName: doc.lastName || "",
    email: normalizeEmail(doc.email || ""),
    street: doc.street || "",
    city: doc.city || "",
    state: doc.state || "",
    zipCode: Number(doc.zipCode) || 0,
    country: doc.country || "",
    phone: doc.phone || "",
  };
  return address;
};

const findFallbackAddress = async (query) => {
  if (query._id) {
    return fallbackDb.addresses.find((addr) => addr._id === String(query._id));
  }
  if (query.userId) {
    return fallbackDb.addresses.filter((addr) => String(addr.userId) === String(query.userId));
  }
  return undefined;
};

const findFallbackAddressById = async (id) => {
  return fallbackDb.addresses.find((addr) => addr._id === String(id));
};

const createFallbackAddress = async (doc) => {
  const newAddress = createFallbackAddressDoc(doc);
  fallbackDb.addresses.push(newAddress);
  saveFallbackDb();
  return newAddress;
};

const matchesQuery = (item, query) => {
  if (!query || Object.keys(query).length === 0) return true;
  return Object.entries(query).every(([key, value]) => {
    if (key === "$or" && Array.isArray(value)) {
      return value.some((subQuery) => matchesQuery(item, subQuery));
    }
    if (typeof value === "object" && value !== null && "$gt" in value) {
      return item[key] > value.$gt;
    }
    if (typeof value === "object" && value !== null && "$ne" in value) {
      return item[key] !== value.$ne;
    }
    return String(item[key]) === String(value);
  });
};

const decorateFallbackOrder = (order) => {
  if (!order || typeof order !== "object") return order;
  if (typeof order.save === "function") return order;
  order.save = async function () {
    const updated = await updateFallbackOrder({ _id: this._id }, this);
    return updated;
  };
  return order;
};

const createFallbackOrderDoc = (doc) => {
  const order = {
    _id: String(fallbackDb.nextId++),
    userId: String(doc.userId || ""),
    items: Array.isArray(doc.items) ? doc.items.map((item) => ({ product: String(item.product), quantity: Number(item.quantity) })) : [],
    amount: Number(doc.amount) || 0,
    address: String(doc.address || ""),
    status: doc.status || "Order Placed",
    paymentType: doc.paymentType || "COD",
    isPaid: doc.isPaid ?? false,
    isStockDeducted: doc.isStockDeducted ?? false,
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),
  };
  return decorateFallbackOrder(order);
};

const findOrdersFallback = (query) => {
  const orders = !query || Object.keys(query).length === 0 ? fallbackDb.orders : fallbackDb.orders.filter((order) => matchesQuery(order, query));
  return orders.map(decorateFallbackOrder);
};

const findFallbackOrder = (query) => {
  const orders = findOrdersFallback(query);
  return orders.length ? orders[0] : null;
};

const findFallbackOrderById = (id) => {
  const order = fallbackDb.orders.find((order) => order._id === String(id));
  return decorateFallbackOrder(order);
};

const createFallbackOrder = async (doc) => {
  const newOrder = createFallbackOrderDoc(doc);
  fallbackDb.orders.push(newOrder);
  saveFallbackDb();
  return newOrder;
};

const createFallbackReviewDoc = (doc) => {
  return {
    _id: String(fallbackDb.nextId++),
    product: String(doc.product || ""),
    user: String(doc.user || ""),
    rating: Number(doc.rating) || 0,
    comment: String(doc.comment || ""),
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),
  };
};

const findReviewsFallback = (query) => {
  if (!query || Object.keys(query).length === 0) return fallbackDb.reviews;
  return fallbackDb.reviews.filter((review) => matchesQuery(review, query));
};

const findFallbackReview = (query) => {
  const reviews = findReviewsFallback(query);
  return reviews.length ? reviews[0] : null;
};

const findFallbackReviewById = (id) => {
  return fallbackDb.reviews.find((review) => review._id === String(id));
};

const createFallbackReview = async (doc) => {
  const newReview = createFallbackReviewDoc(doc);
  fallbackDb.reviews.push(newReview);
  saveFallbackDb();
  return newReview;
};

const updateFallbackReview = async (query, update) => {
  const review = findFallbackReview(query);
  if (!review) return null;
  const index = fallbackDb.reviews.findIndex((item) => item._id === review._id);
  fallbackDb.reviews[index] = {
    ...fallbackDb.reviews[index],
    ...update,
    updatedAt: new Date().toISOString(),
  };
  saveFallbackDb();
  return fallbackDb.reviews[index];
};

const deleteFallbackReview = async (query) => {
  const review = findFallbackReview(query);
  if (!review) return null;
  fallbackDb.reviews = fallbackDb.reviews.filter((item) => item._id !== review._id);
  saveFallbackDb();
  return review;
};

const updateFallbackOrder = async (query, update) => {
  const order = await findFallbackOrder(query);
  if (!order) return null;
  const index = fallbackDb.orders.findIndex((item) => item._id === order._id);
  fallbackDb.orders[index] = {
    ...fallbackDb.orders[index],
    ...update,
    updatedAt: new Date().toISOString(),
  };
  saveFallbackDb();
  return fallbackDb.orders[index];
};

const deleteFallbackOrder = async (query) => {
  const order = await findFallbackOrder(query);
  if (!order) return null;
  fallbackDb.orders = fallbackDb.orders.filter((item) => item._id !== order._id);
  saveFallbackDb();
  return order;
};

const updateFallbackAddress = async (query, update) => {
  const addr = await findFallbackAddress(query);
  if (!addr) return null;
  const index = fallbackDb.addresses.findIndex((item) => item._id === addr._id);
  fallbackDb.addresses[index] = {
    ...fallbackDb.addresses[index],
    ...update,
  };
  saveFallbackDb();
  return fallbackDb.addresses[index];
};

const deleteFallbackAddress = async (query) => {
  const addr = await findFallbackAddress(query);
  if (!addr) return null;
  fallbackDb.addresses = fallbackDb.addresses.filter((item) => item._id !== addr._id);
  saveFallbackDb();
  return addr;
};

export {
  findFallbackUser,
  createFallbackUser,
  findFallbackUserById,
  saveFallbackUser,
  findProductsFallback,
  findProductByIdFallback,
  decrementProductStockFallback,
  aggregateProductsFallback,
  createFallbackAddress,
  findFallbackAddress,
  findFallbackAddressById,
  updateFallbackAddress,
  deleteFallbackAddress,
  createFallbackOrder,
  findFallbackOrder,
  findFallbackOrderById,
  findOrdersFallback,
  updateFallbackOrder,
  deleteFallbackOrder,
  createFallbackReview,
  findFallbackReview,
  findFallbackReviewById,
  findReviewsFallback,
  updateFallbackReview,
  deleteFallbackReview,
  findFallbackNewsletter,
  createFallbackNewsletter,
  updateFallbackNewsletter,
};

import mongoose from "mongoose";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";
import Order from "../models/order.model.js";
import * as fallbackDb from "./fallbackDb.js";
import {
  findFallbackUser,
  createFallbackUser,
  findFallbackUserById,
  saveFallbackUser,
  createFallbackAddress,
  findFallbackAddress,
  findFallbackAddressById,
  updateFallbackAddress,
  deleteFallbackAddress,
  findProductsFallback,
  findProductByIdFallback,
  aggregateProductsFallback,
  createFallbackOrder,
  findFallbackOrderById,
  findFallbackOrder,
  findOrdersFallback,
  updateFallbackOrder,
  deleteFallbackOrder,
  createFallbackReview,
  findFallbackReview,
  findReviewsFallback,
  updateFallbackReview,
  deleteFallbackReview,
  findFallbackNewsletter,
  createFallbackNewsletter,
  updateFallbackNewsletter,
} from "./fallbackDb.js";

let isConnected = false;
export let dbAvailable = false;

const syncFallbackProductsToMongo = async () => {
  const existingProduct = await Product.findOne({ name: "Soft Baby Blanket" });
  if (existingProduct) return;

  const fallbackProducts = findProductsFallback({});
  if (!Array.isArray(fallbackProducts) || fallbackProducts.length === 0) return;

  const productsToInsert = fallbackProducts.map((product) => {
    const { id, _id, updatedAt, ...fields } = product;
    return mongoose.isValidObjectId(_id) ? { ...fields, _id } : fields;
  });

  await Product.insertMany(productsToInsert, { ordered: false });
  console.log(`Synced ${productsToInsert.length} fallback products to MongoDB.`);
};

const getMongoUri = () => {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  return "mongodb://127.0.0.1:27017/grocery-app";
};

// Mock Query object that chains methods and returns fallback results
class MockQuery {
  constructor(data = []) {
    this.data = Array.isArray(data) ? [...data] : [];
  }

  sort(spec) {
    if (spec && this.data.length > 0) {
      const [field, direction] = Object.entries(spec)[0];
      this.data.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (aVal === bVal) return 0;
        const result = aVal > bVal ? 1 : -1;
        return direction === -1 ? -result : result;
      });
    }
    return this;
  }

  skip(n) {
    this.data = this.data.slice(n);
    return this;
  }

  limit(n) {
    this.data = this.data.slice(0, n);
    return this;
  }

  populate() {
    return this;
  }

  exec() {
    return Promise.resolve(this.data);
  }

  then(onFulfilled, onRejected) {
    return Promise.resolve(this.data).then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return Promise.resolve(this.data).catch(onRejected);
  }
}

export function applyFallbackPatches() {
  try {
    mongoose.set("bufferCommands", false);
    if (User) {
      User.findOne = async (query) => await findFallbackUser(query);
      User.create = async (doc) => await createFallbackUser(doc);
      User.findById = async (id) => await findFallbackUserById(id);
      User.findByIdAndUpdate = async (id, update) => {
        const user = await findFallbackUserById(id);
        if (!user) return null;
        const updated = await saveFallbackUser({ ...user, ...update });
        return updated;
      };
      User.findOneAndUpdate = async (query, update) => {
        const user = await findFallbackUser(query);
        if (!user) return null;
        const updated = await saveFallbackUser({ ...user, ...update });
        return updated;
      };
    }
    if (Product) {
      Product.find = (query) => new MockQuery(fallbackDb.findProductsFallback(query));
      Product.findOne = async (query) => {
        const results = await fallbackDb.findProductsFallback(query);
        return Array.isArray(results) ? results[0] : results;
      };
      Product.findById = async (id) => await findProductByIdFallback(id);
      Product.countDocuments = async (query) => {
        const results = await fallbackDb.findProductsFallback(query);
        return Array.isArray(results) ? results.length : 0;
      };
      Product.aggregate = async (pipeline) => aggregateProductsFallback(pipeline);
    }
    if (Order) {
      Order.create = async (doc) => await createFallbackOrder(doc);
      Order.find = (query) => new MockQuery(findOrdersFallback(query));
      Order.findOne = async (query) => await findFallbackOrder(query);
      Order.findById = async (id) => await findFallbackOrderById(id);
      Order.findByIdAndUpdate = async (id, update) => await updateFallbackOrder({ _id: id }, update);
      Order.findOneAndUpdate = async (query, update) => await updateFallbackOrder(query, update);
      Order.findOneAndDelete = async (query) => await deleteFallbackOrder(query);
    }
    if (Address) {
      Address.create = async (doc) => await createFallbackAddress(doc);
      Address.find = async (query) => await findFallbackAddress(query);
      Address.findOne = async (query) => await findFallbackAddress(query);
      Address.findById = async (id) => await findFallbackAddressById(id);
      Address.findOneAndUpdate = async (query, update) => await updateFallbackAddress(query, update);
      Address.findOneAndDelete = async (query) => await deleteFallbackAddress(query);
    }
    const Review = mongoose.models.Review || mongoose.modelNames().includes('Review') ? mongoose.model('Review') : null;
    if (Review) {
      Review.find = (query) => new MockQuery(findReviewsFallback(query));
      Review.findOne = async (query) => await findFallbackReview(query);
      Review.findOneAndUpdate = async (query, update, options) => {
        const existing = await findFallbackReview(query);
        if (!existing) {
          if (options?.upsert) {
            const doc = { ...query, ...update };
            return await createFallbackReview(doc);
          }
          return null;
        }
        return await updateFallbackReview(query, update);
      };
      Review.findOneAndDelete = async (query) => await deleteFallbackReview(query);
      Review.findById = async (id) => await findFallbackReviewById(id);
    }

    const Newsletter = mongoose.models.Newsletter || mongoose.modelNames().includes('Newsletter') ? mongoose.model('Newsletter') : null;
    if (Newsletter) {
      Newsletter.findOne = async (query) => await findFallbackNewsletter(query);
      Newsletter.findOneAndUpdate = async (query, update, options) => {
        const existing = await findFallbackNewsletter(query);
        if (!existing) {
          if (options?.upsert) {
            const doc = { ...query, ...update };
            return await createFallbackNewsletter(doc);
          }
          return null;
        }
        return await updateFallbackNewsletter(query, update);
      };
    }
    console.warn("Applied fallback patches to models due to MongoDB unavailability.");
  } catch (err) {
    console.warn("Failed to apply fallback patches:", err.message);
  }
}

export const connectDB = async () => {
  if (isConnected) return;
  if (!process.env.MONGO_URI) {
    dbAvailable = false;
    applyFallbackPatches();
    console.warn("No MONGO_URI is configured. Using fallback storage.");
    return;
  }
  const uri = getMongoUri();

  try {
    await mongoose.connect(uri);
    isConnected = true;
    dbAvailable = true;
    try {
      await syncFallbackProductsToMongo();
    } catch (error) {
      console.warn("Could not sync fallback products to MongoDB:", error.message);
    }
    console.log("MongoDB connected");
  } catch (error) {
    dbAvailable = false;
    console.error("Error connecting to MongoDB:", error.message || error);

    if (!process.env.MONGO_URI) {
      console.error(
        "No MONGO_URI is configured. Falling back to in-memory user storage for development."
      );
    }

    if (error.code === "ECONNREFUSED" && uri.startsWith("mongodb+srv://")) {
      console.error(
        "Atlas SRV DNS lookup failed. Check your MongoDB Atlas network access, firewall/DNS settings, and make sure your current IP is allowed."
      );
    }

    // Apply patches immediately when connection fails
    applyFallbackPatches();
  }
};

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model("Product", productSchema);

const TARGET_CATEGORIES = [
  "Grocery",
  "Meat",
  "Beauty",
  "Kitchen",
  "Garments",
  "Baby Items",
];

async function cloneSports() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const sports = await Product.find({ category: "Sports" }).limit(5).lean();
    if (!sports || sports.length === 0) {
      console.log("No Sports products found to clone.");
      return;
    }

    const clones = [];
    for (const orig of sports) {
      for (const cat of TARGET_CATEGORIES) {
        const clone = { ...orig };
        // Remove _id so Mongo assigns a new one, keep a reference to original
        clone.originalProductId = orig._id;
        delete clone._id;
        clone.category = cat;
        clones.push(clone);
      }
    }

    if (clones.length === 0) {
      console.log("Nothing to insert.");
      return;
    }

    const inserted = await Product.insertMany(clones);
    console.log(`Inserted ${inserted.length} cloned products across ${TARGET_CATEGORIES.length} categories.`);

    // Summary counting
    const summary = {};
    for (const cat of TARGET_CATEGORIES) summary[cat] = 0;
    inserted.forEach((p) => { summary[p.category] = (summary[p.category] || 0) + 1; });
    console.log("Summary:");
    console.table(summary);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

cloneSports();

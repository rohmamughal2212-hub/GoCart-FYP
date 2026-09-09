import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/grocery-app";

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  offerPrice: Number,
  description: Array,
  image: Array,
  inStock: Boolean,
});

const Product = mongoose.model("Product", productSchema);

try {
  await mongoose.connect(mongoUri);
  console.log("✅ Connected to MongoDB");

  // Get all categories and their counts
  const categories = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  console.log("\n📊 All categories in database:");
  categories.forEach((cat) => {
    console.log(`  - ${cat._id}: ${cat.count} products`);
  });

  // Test Sports query (case-sensitive)
  console.log("\n🔍 Testing queries:");
  const sportsCaseSensitive = await Product.find({ category: "Sports" });
  console.log(`  Sports (exact case): ${sportsCaseSensitive.length} products`);

  const sportsLowercase = await Product.find({ category: "sports" });
  console.log(`  sports (lowercase): ${sportsLowercase.length} products`);

  // Test with regex (case-insensitive)
  const sportsRegex = await Product.find({
    category: new RegExp(`^Sports$`, "i"),
  });
  console.log(`  Sports (regex case-insensitive): ${sportsRegex.length} products`);

  // Show first Sports product if any
  if (sportsCaseSensitive.length > 0) {
    console.log(
      `\n✅ First Sports product: ${sportsCaseSensitive[0].name}`
    );
  } else if (sportsRegex.length > 0) {
    console.log(`\n⚠️  Sports products found with regex: ${sportsRegex[0].name}`);
    console.log(`    Actual category in DB: "${sportsRegex[0].category}"`);
  } else {
    console.log("\n❌ No Sports products found in database!");
  }

  await mongoose.disconnect();
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}

import Review from "../models/review.model.js";

// POST /api/review/add
export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user;

    if (!productId || !rating || !comment)
      return res.status(400).json({ success: false, message: "Product, rating, and comment are required" });
    if (rating < 1 || rating > 5)
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });

    // Upsert: one review per user per product
    const review = await Review.findOneAndUpdate(
      { product: productId, user: userId },
      { rating, comment },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, message: "Review submitted", review });
  } catch (error) {
    console.error("addReview error:", error);
    res.status(500).json({ success: false, message: "Failed to submit review", error: error.message });
  }
};

// GET /api/review/:productId
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.status(200).json({ success: true, reviews, avgRating: Math.round(avgRating * 10) / 10, total: reviews.length });
  } catch (error) {
    console.error("getProductReviews error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch reviews", error: error.message });
  }
};

// DELETE /api/review/:id
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findOneAndDelete({ _id: id, user: req.user });
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("deleteReview error:", error);
    res.status(500).json({ success: false, message: "Failed to delete review", error: error.message });
  }
};

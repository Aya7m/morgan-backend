import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

// حساب المتوسط وتحديث بيانات المنتج
export const updateProductRating = async (productId) => {
  const reviews = await Review.find({ productId });
  const avgRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  await Product.findByIdAndUpdate(productId, {
    averageRating: avgRating.toFixed(1),
    numReviews: reviews.length,
  });
};

// إضافة أو تحديث الريفيو
export const addReview = async (req, res) => {
  try {
    const userId = req.authuser._id;
    const { productId, rating, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ message: "Product ID and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const existing = await Review.findOne({ userId, productId });

    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      await existing.save();
      await updateProductRating(productId);

      return res.status(200).json({ message: "Review updated", review: existing });
    }

    const review = await Review.create({ userId, productId, rating, comment });

    await updateProductRating(productId);

    res.status(201).json({ message: "Review added", review });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// جلب الريفيوهات لمنتج معين
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId })
      .populate("userId", "name email");

    res.status(200).json({ message: "Reviews fetched", reviews });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

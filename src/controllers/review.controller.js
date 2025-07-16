import { Review } from "../models/review.model.js";

export const addReview = async (req, res) => {
    const userId = req.authuser._id;
    const { productId, rating, comment } = req.body;

    const existing = await Review.findOne({ userId, productId });
    if (existing) {
        return res.status(400).json({ message: "You already reviewed this product" });
    }

    const review = await Review.create({ userId, productId, rating, comment });

    res.status(201).json({ message: "Review added", review });
};


export const getProductReviews = async (req, res) => {
  const { productId } = req.params;

  const reviews = await Review.find({ productId })
    .populate("userId", "name email");

  res.status(200).json({ message: "Reviews fetched", reviews });
};

import { Wishlist } from "../models/wishlist.model.js";

// controllers/wishlist.controller.js
export const addToWishlist = async (req, res) => {
    try {
        const userId = req.authuser._id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        let wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            wishlist = await Wishlist.create({ userId, products: [productId] });
        } else {
            if (!wishlist.products.includes(productId)) {
                wishlist.products.push(productId);
                await wishlist.save();
            }
        }

        res.status(200).json({ message: "Added to wishlist", wishlist });
    } catch (error) {
        console.error("Add to Wishlist Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};



export const removeFromWishlist = async (req, res) => {
    const userId = req.authuser._id;
    const { productId } = req.body;

    const wishlist = await Wishlist.findOneAndUpdate(
        { userId },
        { $pull: { products: productId } },
        { new: true }
    );

    res.status(200).json({ message: "Removed from wishlist", wishlist });
};


export const getWishlist = async (req, res) => {
    const userId = req.authuser._id;

    const wishlist = await Wishlist.findOne({ userId }).populate("products");

    res.status(200).json({ message: "Wishlist fetched", wishlist });
};
export const clearWishlist = async (req, res) => {
    const userId = req.authuser._id;

    await Wishlist.findOneAndUpdate(
        { userId },
        { $set: { products: [] } },
        { new: true }
    );

    res.status(200).json({ message: "Wishlist cleared" });
};
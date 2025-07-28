// add to cart
import { Cart } from "../models/cart.model.js";
import { Coupon } from "../models/coupen.model.js";
import { Product } from "../models/product.model.js";



export const addToCart = async (req, res) => {
    try {
        const userId = req.authuser._id;
        const { productId, color, size, quantity } = req.body;

        if (!productId || !color || !size || !quantity) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // ✅ Normalize color
        const normalizedColor = color.trim().toLowerCase();

        // ✅ Find matching variant
        const variant = product.variants.find(
            (v) => v.color && v.color.trim().toLowerCase() === normalizedColor
        );

        if (!variant) {
            return res.status(404).json({ message: `Color variant '${color}' not found` });
        }

        // ✅ Find matching size
        const sizeData = variant.sizes.find(s => s.size === size);
        if (!sizeData) {
            return res.status(404).json({ message: `Size '${size}' not found for color '${color}'` });
        }

        // ✅ Check stock
        if (sizeData.stock < quantity) {
            return res.status(400).json({ message: "Insufficient stock" });
        }

        const itemPrice = sizeData.price;
        const itemTotal = itemPrice * quantity;

        // ✅ Check for existing cart
        let cart = await Cart.findOne({ userId });

        const newProduct = {
            productId,
            color,
            size,
            quantity,
            price: itemPrice,
        };

        if (cart) {
            cart.products.push(newProduct);
            cart.total += itemTotal;
        } else {
            cart = new Cart({
                userId,
                products: [newProduct],
                total: itemTotal,
            });
        }

        await cart.save();

        res.status(201).json({
            message: "Product added to cart successfully",
            data: cart,
        });

    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};




export const removeFromCart = async (req, res) => {
    try {
        const userId = req.authuser._id;
        const { productId } = req.params;

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // فلترة المنتجات مع استبعاد المنتج المطلوب حذفه
        cart.products = cart.products.filter(p => p.productId.toString() !== productId);

        // إعادة حساب التوتال
        cart.total = cart.products.reduce((acc, item) => acc + item.price * item.quantity, 0);

        await cart.save();

        return res.status(200).json({ message: "Product removed from cart", data: cart });

    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }

}


// update cart item



export const updateCartItem = async (req, res) => {
    try {
        const userId = req.authuser._id;
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const productInCart = cart.products.find(p => p.productId.toString() === productId);
        if (!productInCart) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        productInCart.quantity = quantity;

        // إعادة حساب التوتال
        cart.total = cart.products.reduce((sum, item) => sum + item.quantity * item.price, 0);

        const updatedCart = await cart.save();

        res.status(200).json({ message: "Cart updated successfully", data: updatedCart });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// get cart items
export const getCart = async (req, res) => {
    try {
        const userId = req.authuser._id;

        const cart = await Cart.findOne({ userId })
            .populate("products.productId", "title variants slug") // بنجيب تفاصيل المنتج
            .exec();

        if (!cart) {
            return res.status(200).json({ message: "Cart is empty", data: [] });
        }

        res.status(200).json({
            message: "Cart fetched successfully",
            data: cart
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const applyCoupon = async (req, res) => {
    try {
        const userId = req.authuser._id;
        const { code } = req.body;

        if (!code) return res.status(400).json({ message: "Coupon code is required" });

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
        if (!coupon || coupon.expiresAt < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired coupon" });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const discountAmount = coupon.type === "percent"
            ? (cart.total * coupon.amount) / 100
            : coupon.amount;

        const totalAfterDiscount = cart.total - discountAmount;

        // Optional: تحفظ الخصم فالسلة
        cart.total = totalAfterDiscount;
        await cart.save();

        res.status(200).json({
            message: "Coupon applied successfully",
            discount: discountAmount,
            totalAfterDiscount,
            coupon: coupon.code
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
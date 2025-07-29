import { Cart } from "../models/cart.model.js";
import { Coupon } from "../models/coupen.model.js";
import { Order } from "../models/order.model.js";
import { stripe } from "../utilites/stripe.js";

export const createCheckoutSession = async (req, res) => {
    try {
        const userId = req.authuser._id;
        const { couponCode } = req.body;

        const cart = await Cart.findOne({ userId }).populate("products.productId");
        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // حساب السعر الكلي
        let total = 0;
        cart.products.forEach(item => {
            total += item.quantity * item.price;
        });

        // خصم الكوبون إن وجد
        let discount = 0;
        let stripeCouponId = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
            if (!coupon) return res.status(400).json({ message: "Invalid coupon" });

            if (coupon.type === "percent") {
                discount = (total * coupon.amount) / 100;
            } else {
                discount = coupon.amount;
            }

            // إنشاء كوبون Stripe
            const stripeCoupon = await stripe.coupons.create({
                percent_off: discount ? (discount / total) * 100 : 0,
                duration: 'once'
            });
            stripeCouponId = stripeCoupon.id;
        }

        const finalAmount = Math.max(0, total - discount);

        // إنشاء جلسة Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: cart.products.map(item => ({
                price_data: {
                    currency: "egp",
                    product_data: {
                        name: item.productId.title,
                    },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity,
            })),
            discounts: stripeCouponId ? [{ coupon: stripeCouponId }] : [],
            metadata: {
                userId: userId.toString(),
                cartId: cart._id.toString(),
                couponCode: couponCode || "",
            },
            success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/cart`,
        });

        // إنشاء الأوردر بعد الجلسة
        const order = await Order.create({
            userId,
            products: cart.products,
            total,
            discount,
            finalTotal: finalAmount,
            paymentStatus: "pending",
            stripeSessionId: session.id,
        });


        // ✅ 2. مسح الكارت بعد إنشاء الأوردر
        await Cart.findOneAndDelete({ userId });
        // تحديث metadata عشان نضيف orderId
        await stripe.checkout.sessions.update(session.id, {
            metadata: {
                ...session.metadata,
                orderId: order._id.toString(),
            }
        });

        res.status(200).json({ url: session.url, sessionId: session.id, total: finalAmount });

    } catch (err) {
        res.status(500).json({ message: "Stripe error", error: err.message });
    }
};


export const getOrderDetails = async (req, res) => {
    try {
        const userId = req.authuser._id;
        const { sessionId } = req.query;

        if (!sessionId) {
            return res.status(400).json({ message: "Session ID is required" });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        if (session.metadata.userId !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const orderId = session.metadata.orderId;
        if (!orderId) {
            return res.status(400).json({ message: "Order ID not found in session metadata" });
        }

        const order = await Order.findById(orderId)
            .populate("userId", "name email")
            .populate("products.productId", "title slug variants");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            message: "Order details fetched successfully",
            order,
            paymentInfo: session
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

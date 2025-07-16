import mongoose from "mongoose";
const { Schema, model } = mongoose;

const orderSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    total: Number,
    discount: Number,
    finalTotal: Number,
    paymentStatus: { type: String, default: "pending" },
    stripeSessionId: { type: String } // مهم جدًا
}, { timestamps: true });




export const Order = model("Order", orderSchema);

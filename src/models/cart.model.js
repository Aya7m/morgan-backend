import mongoose, { model } from "mongoose";
import { Schema } from "mongoose";

const cartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        }

    }],
    total: {
        type: Number,
        required: true
    }

}, { timestamps: true });

export const Cart = model("Cart", cartSchema)
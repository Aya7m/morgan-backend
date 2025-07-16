import mongoose from "mongoose";
import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";




const productSchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        trim: true,
    },
    specs: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    badges: {
        type: [String],
        enum: ["new", "hot", "sale", "best-seller"],
        default: [],
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    subCategory: {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    discount: {
        amount: {
            type: Number,
            min: 0,
            default: 0,
        },
        type: {
            type: String,
            enum: ["percent", "fixed"],
            default: "percent",
        },
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    variants: [
        {
            color: String,
            images: [
                {
                    customId: String,
                    urls: {
                        secure_url: String,
                        public_id: String
                    }
                }
            ],
            sizes: [
                {
                    size: String,
                    price: Number,
                    stock: Number
                }
            ]
        }
    ]

}, {
    timestamps: true,
});
productSchema.plugin(mongoosePaginate);

export const Product = model("Product", productSchema);

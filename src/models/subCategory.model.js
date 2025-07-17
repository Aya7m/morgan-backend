import mongoose from 'mongoose';

import { Schema, model } from "mongoose";

const subCategorySchema = new Schema({
    name: {
        type: String,
        trim: true,
        unique: true,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    createBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
       
        required: true,
    },
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            secure_url: {
                type: String,
                required: true,
            },
        },
    ],
    customId: {
        type: String,
        unique: true,
        required: false,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
}, {
    timestamps: true,
});

export const SubCategory = model("SubCategory", subCategorySchema);
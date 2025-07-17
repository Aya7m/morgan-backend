import { Schema, model } from "mongoose";

const categorySchema = new Schema({
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
}, {
    timestamps: true,
});

export const Category = model("Category", categorySchema);
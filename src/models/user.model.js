import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        trim: true,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    phone: {
        type: String,
        trim: true,
        required: false,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isMarketedAsDefault: {
        type: Boolean,
        default: false,
    },
   
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    timestamps: true,
});

export const User = model("User", userSchema);


import mongoose from "mongoose";
import { model, Schema } from "mongoose";

const addressSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    country: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },

    postalCode: {
        type: Number,
        required: true
    },
    buildingNumber: {
        type: Number,
        required: true
    },
    floorNumber: {
        type: Number
    },
   
    isDefault: {
        type: Boolean,
        default: false
    },
    isMarkedDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

export const Address = model("Address", addressSchema);
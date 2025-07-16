import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const db_connection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Database connected successfully");

    } catch (error) {
        console.error("Database connection failed:", error);
        throw error;

    }
}

export default db_connection;
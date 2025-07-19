import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Address } from "../models/address.model.js";

dotenv.config();

export const signUp = async (req, res) => {
    try {
        const { name, email, password, phone, country, city, buildingNumber, floorNumber, postalCode } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const user = await User.create({ name, email, password, phone });

        const address = await Address.create({
            user: user._id,
            country,
            city,
            buildingNumber,
            floorNumber,
            postalCode
        });

        user.address.push(address._id);
        await user.save();

        res.status(201).json({ user, address });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Registration failed" });
    }
}

// update account
export const updateAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role, password } = req.body;

        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (role) user.role = role;
        if (password) {
            // hash new password
            user.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await user.save();
        res.status(200).json({ message: "User updated successfully", data: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }

}

// forgot password

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 1000 * 60 * 10; // 10 دقائق

        await user.save();

        const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,        // تأكدي إنه جاي صح
                pass: process.env.EMAIL_PASS,   // تأكدي إنه مش undefined
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        await transporter.sendMail({
            from: `"Support" <${process.env.EMAIL}>`,
            to: email,
            subject: "Reset your password",
            html: `<p>Click the link below to reset your password:</p>
             <a href="${resetURL}">${resetURL}</a>
             <p>Link valid for 10 minutes.</p>`,
        });

        res.status(200).json({ message: "Reset password link sent to your email." });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// reset password
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: "Missing token or password" });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Token is invalid or has expired" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



// login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id }, // ✅ هنا التعديل
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: "Login successful",
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// get me
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.authuser._id)
            .select("-password")
            .populate("address"); // ✅ populate address مباشرة

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User fetched successfully", data: user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

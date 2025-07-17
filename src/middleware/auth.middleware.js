
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const auth = () => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized, token missing or invalid format" });
      }

      const token = authHeader.split(" ")[1]; // خدي التوكن بس بعد كلمة Bearer

      const decodedData = jwt.verify(token, process.env.JWT_SECRET);

      if (!decodedData.userId) {
        return res.status(401).json({ error: "Unauthorized, invalid token data" });
      }

      const user = await User.findById(decodedData.userId).select("-password");

      if (!user) {
        return res.status(401).json({ error: "Please sign up first and try again" });
      }

      req.authuser = user;
      next();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
};

export const authRole = (admin) => {
  return (req, res, next) => {
    if (!req.authuser || req.authuser.role !== admin) {
      return res.status(403).json({ error: "Forbidden, you do not have permission to access this resource" });
    }
    next();
  };
};

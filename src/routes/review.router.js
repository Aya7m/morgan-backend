import { Router } from "express";

const reviewRouter = Router();
import { auth } from "../middleware/auth.middleware.js";
import { addReview, getProductReviews } from "../controllers/review.controller.js";
reviewRouter.post('/create', auth(), addReview)
reviewRouter.get('/get-all/:productId',getProductReviews) // Assuming you have a function to get all reviews

export default reviewRouter;
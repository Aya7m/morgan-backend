import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import { createCheckoutSession,  getOrderDetails } from "../controllers/order.controller.js";

const orderRouter = Router()
orderRouter.post('/create-checkout-session', auth(), createCheckoutSession)

orderRouter.get('/get-all-details', auth(), getOrderDetails) // Assuming you want to get all order details

export default orderRouter;
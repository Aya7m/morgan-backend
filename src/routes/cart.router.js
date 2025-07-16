import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import { addToCart, applyCoupon, getCart, removeFromCart, updateCartItem } from "../controllers/cart.controller.js";

const cartRouter=Router();

cartRouter.post('/add',auth(),addToCart); // Assuming addToCart is a function to add items to the cart
cartRouter.delete('/remove/:productId', auth(),removeFromCart); // Assuming removeFromCart is a function to remove items from the cart)
cartRouter.put('/update/:productId', auth(), updateCartItem); // Assuming addToCart can also be used to update the quantity of an item in the cart
cartRouter.get('/getCart',auth(),getCart)
cartRouter.post("/apply-coupon", auth(), applyCoupon)
export default cartRouter;
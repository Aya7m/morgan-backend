import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import { addToWishlist, clearWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlist.controller.js";

const wishlistRouter = Router();

wishlistRouter.post('/add', auth(), addToWishlist)
wishlistRouter.get('/', auth(), getWishlist)
wishlistRouter.delete('/remove', auth(), removeFromWishlist)
wishlistRouter.delete('/delete-all', auth(), clearWishlist)

export default wishlistRouter;
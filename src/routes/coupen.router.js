import { Router } from "express";

const coupenRouter=Router()

import { auth } from "../middleware/auth.middleware.js";
import { createCoupon, deleteCoupon, getAllCoupons, updateCoupon } from "../controllers/coupen.controller.js";

coupenRouter.post('/create',auth(),createCoupon)
coupenRouter.get('/',getAllCoupons)
coupenRouter.put('/:id',auth(),updateCoupon)
coupenRouter.delete('/:id',auth(),deleteCoupon)
export default coupenRouter





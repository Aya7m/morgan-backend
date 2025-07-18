import { Router } from "express";
import { forgotPassword, getMe, loginUser, resetPassword, signUp, updateAccount } from "../controllers/user.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const userRouter=Router();

userRouter.post('/register',signUp);
userRouter.post('/login',loginUser); // Assuming you have a login function in user.controller.js
userRouter.put('/update/:id',auth(),updateAccount); // Assuming you have an update function in user.controller.js
userRouter.post('/forgot-password',auth(), forgotPassword); // Assuming you have a forgotPassword function in user.controller.js
userRouter.post('/reset-password/:token',auth(),resetPassword)
userRouter.get('/me',auth(),getMe)
export default userRouter;
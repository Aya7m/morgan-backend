import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import { addNewAddress, deleteAddress, editAddress, getAllAddresses } from "../controllers/address.controller.js";


const addressRouter = Router();

addressRouter.post('/add', auth(), addNewAddress)
addressRouter.put('/edit/:addressId', auth(), editAddress); // Assuming editAddress is the same as addNewAddress for simplicity
addressRouter.put('/remove/:addressId', auth(), deleteAddress); // Assuming editAddress is the same as addNewAddress for simplicity
addressRouter.get('/get', auth(),getAllAddresses); // Assuming getAddress is a function to retrieve addresses)
export default addressRouter;
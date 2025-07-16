import { Router } from "express";
import { createCategory, deleteCategory, getCategory, updateCategory } from "../controllers/category.controller.js";
import { multerLocalhost } from "../middleware/multer.meddleware.js";
import { extention } from "../utilites/fileExtention.utilites.js";

const categoryRouter = Router();

categoryRouter.post('/create', multerLocalhost({ allowedExtensions: extention.Images }).single('image'), createCategory);
categoryRouter.get('/', getCategory);
categoryRouter.put('/:id', multerLocalhost({ allowedExtensions: extention.Images }).single('image'), updateCategory);
categoryRouter.delete('/:id', multerLocalhost({ allowedExtensions: extention.Images }).single('image'), deleteCategory)

export default categoryRouter;
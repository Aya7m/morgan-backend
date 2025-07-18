import { Router } from "express";
import { multerLocalhost } from "../middleware/multer.meddleware.js";
import { createSubCategory, deleteSubCategory, getSubCategory, updateSubCategory } from "../controllers/subCategory.controller.js";
import { extention } from "../utilites/fileExtention.utilites.js";
import { auth } from "../middleware/auth.middleware.js";

const subCategoryRouter = Router();

subCategoryRouter.post('/create',auth(),
    multerLocalhost({ allowedExtensions: extention.Images }).single('image'),
    createSubCategory);

subCategoryRouter.get('/', getSubCategory);
subCategoryRouter.put('/:id',auth(), multerLocalhost({ allowedExtensions: extention.Images }).single('image'), updateSubCategory);
subCategoryRouter.delete('/:id',auth(), multerLocalhost({ allowedExtensions: extention.Images }).single('image'), deleteSubCategory);

export default subCategoryRouter;
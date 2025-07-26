import { Router } from "express";
import { createProduct, deleteProduct,  getProductById,  getProducts, getRecommendedProducts, updateProduct } from "../controllers/product.controller.js";
import { extention } from "../utilites/fileExtention.utilites.js";
import { multerLocalhost } from "../middleware/multer.meddleware.js";
import { auth, authRole } from "../middleware/auth.middleware.js";

const productRouter=Router();
productRouter.post('/create',auth(),
  multerLocalhost({ allowedExtensions: extention.Images }).fields([
    { name: 'variantImages_0', maxCount: 5 },
    { name: 'variantImages_1', maxCount: 5 },
    { name: 'variantImages_2', maxCount: 5 },
    { name: 'variantImages_3', maxCount: 5 },
    { name: 'variantImages_4', maxCount: 5 },
    // { name: 'variantImages_5', maxCount: 5 }, // يمكنك إضافة المزيد من الفاريانت حسب الحاجة
   
    
  
    // زودي على حسب عدد الفاريانت
  ]),
  createProduct
);


productRouter.get('/',getProducts);

productRouter.put('/:id', 
  multerLocalhost({ allowedExtensions: extention.Images }).fields([
    { name: 'variantImages_0', maxCount: 5 },
    { name: 'variantImages_1', maxCount: 5 },
    { name: 'variantImages_2', maxCount: 5 },
    { name: 'variantImages_3', maxCount: 5 },
    // { name: 'variantImages_4', maxCount: 5 },
    // { name: 'variantImages_5', maxCount: 5 }, // يمكنك إضافة المزيد من الفاريانت حسب الحاجة
  ]),
  updateProduct
);


productRouter.delete('/:id',deleteProduct);
productRouter.get("/recommended/:productId", getRecommendedProducts);
productRouter.get("/:id",getProductById);



export default productRouter;
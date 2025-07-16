import express from 'express'
const app = express()
const port = 3000
import dotenv from 'dotenv'
import db_connection from './src/db/connection.js'

import categoryRouter from './src/routes/category.router.js'
import subCategoryRouter from './src/routes/subCategory.router.js'
import productRouter from './src/routes/product.router.js'
import userRouter from './src/routes/user.router.js'
import addressRouter from './src/routes/address.router.js'
import cartRouter from './src/routes/cart.router.js'
import coupenRouter from './src/routes/coupen.router.js'
import orderRouter from './src/routes/order.router.js'
import wishlistRouter from './src/routes/wishlist.router.js'
import reviewRouter from './src/routes/review.router.js'
dotenv.config()



db_connection();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/category', categoryRouter);
app.use('/api/subCategory', subCategoryRouter); // Assuming subCategory routes are also handled by categoryRouter
app.use('/api/product',productRouter);
app.use('/api/user',userRouter);
app.use('/api/address', addressRouter); // Assuming you have an address router
app.use('/api/cart', cartRouter); // Assuming you have a cart router
app.use('/api/coupon',coupenRouter); // Assuming you have a coupon router
app.use('/api/order', orderRouter); // Assuming you have an order router
app.use('/api/wishlist', wishlistRouter); // Assuming you have a wishlist router
app.use('/api/review', reviewRouter); // Assuming you have a review router

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
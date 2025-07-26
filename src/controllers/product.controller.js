import { Product } from "../models/product.model.js";
import { cloudinaryConfig } from "../utilites/cloudinary.utilites.js";
import slugify from "slugify";
import { nanoid } from "nanoid";

export const createProduct = async (req, res) => {
    try {
        const {
            title,
            description,
            specs,
            badges,
            createdBy,
            variants
        } = req.body;

        const category = req.query.category;
        const subCategory = req.query.subCategory;

        if (!title || !category || !subCategory || !variants || variants.length === 0) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: "At least one image is required" });
        }

        const slug = slugify(title, { lower: true });
        const productCustomId = nanoid(5);
        const parsedVariants = [];

        const parsedVariantList = typeof variants === "string" ? JSON.parse(variants) : variants;

        for (let i = 0; i < parsedVariantList.length; i++) {
            const variant = parsedVariantList[i];

            const { color, sizes, price, stock, discount } = variant;

            if (!color) {
                return res.status(400).json({ message: `Missing color in variant ${i + 1}` });
            }

            const hasSizes = sizes && sizes.length > 0;
            const hasSimplePricing = price != null && stock != null;

            if (!hasSizes && !hasSimplePricing) {
                return res.status(400).json({ message: `Variant ${i + 1} must have sizes or price & stock` });
            }


            // الصور المتعددة لكل لون
            const imageFiles = req.files?.[`variantImages_${i}`];
            if (!imageFiles || imageFiles.length === 0) {
                return res.status(400).json({ message: `At least one image is required for color ${color}` });
            }

            const variantImages = [];
            for (let j = 0; j < imageFiles.length; j++) {
                const file = imageFiles[j];
                const imageCustomId = nanoid(4);
                const uploadResult = await cloudinaryConfig().uploader.upload(file.path, {
                    folder: `${process.env.UPLOADS_FOLDER}/products/${productCustomId}/variants/${i}/img_${imageCustomId}`,
                });

                variantImages.push({
                    customId: imageCustomId,
                    urls: {
                        secure_url: uploadResult.secure_url,
                        public_id: uploadResult.public_id
                    }
                });
            }

            parsedVariants.push({
                color,
                images: variantImages,
                ...(hasSizes
                    ? { sizes }  // مثال: [{ size: 'M', price: 100, stock: 5 }]
                    : { sizes: [{ size: null, price, stock, discount }] } // لو إكسسوار بدون size
                )
            });

        }

        let newProduct = await Product.create({
            title,
            slug,
            description,
            specs: specs || {},
            badges,
            category,
            subCategory,
            createdBy: req.authuser._id,
            variants: parsedVariants
        });

        // Populate category & subCategory names
        // newProduct = await newProduct
        //     .populate("category", "name slug")
        //     .populate("subCategory", "name slug")
        //     .execPopulate?.(); // For older Mongoose versions
        // // OR if execPopulate throws error (Mongoose v6+), use this:
        newProduct = await Product.findById(newProduct._id)
            .populate("category", "name slug")
            .populate("subCategory", "name slug");

        return res.status(201).json({
            message: "Product created successfully",
            data: newProduct
        });


    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// get products by id,name,slug
export const getProducts = async (req, res) => {
    try {
        const {
            id,
            name,
            title,
            slug,
            color,
            minPrice,
            maxPrice,
            categoryName,
            subCategoryName,
            subCategoryId,
            badges,
            ratingFrom,
            ratingTo,
            createdBy,
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            order = "desc"
        } = req.query;

        const query = {};

        if (id) query._id = id;
        if (slug) query.slug = slug;

        // فلترة بالاسم
        if (name || title) {
            query.title = new RegExp(name || title, "i");
        }

        // فلترة باللون
        if (color) {
            query["variants.color"] = new RegExp(color, "i");
        }

        // فلترة بالسعر
        if (minPrice || maxPrice) {
            query["variants.sizes.price"] = {};
            if (minPrice) query["variants.sizes.price"].$gte = parseFloat(minPrice);
            if (maxPrice) query["variants.sizes.price"].$lte = parseFloat(maxPrice);
        }

        // فلترة باسم التصنيف
        if (categoryName) {
            const category = await Category.findOne({ name: new RegExp(categoryName, "i") });
            if (category) query.category = category._id;
        }

        // فلترة باسم السابكاتيجوري
        if (subCategoryName) {
            const subCat = await SubCategory.findOne({ name: new RegExp(subCategoryName, "i") });
            if (subCat) query.subCategory = subCat._id;
        }

        if (req.query.subCategoryId) {
            query.subCategory = req.query.subCategoryId;
        }

        // فلترة بالباجز
        if (badges) {
            const badgesArray = Array.isArray(badges) ? badges : badges.split(",");
            query.badges = { $in: badgesArray };
        }

        // فلترة بالتقييم
        if (ratingFrom || ratingTo) {
            query.rating = {};
            if (ratingFrom) query.rating.$gte = parseFloat(ratingFrom);
            if (ratingTo) query.rating.$lte = parseFloat(ratingTo);
        }

        // فلترة بالمستخدم المنشئ
        if (createdBy) {
            query.createdBy = createdBy;
        }



        // Pagination + Sorting
        const sortOption = {};
        sortOption[sortBy] = order === "asc" ? 1 : -1;

        const skip = (page - 1) * limit;

        const products = await Product.find(query)
            .populate("category", "name slug")
            .populate("subCategory", "name slug")
            .populate("createdBy", "name email")
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        const totalCount = await Product.countDocuments(query);

        res.status(200).json({
            message: "Products fetched successfully",
            total: totalCount,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / limit),
            data: products,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};





// update product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, specs, badges, variants } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // العنوان والسلاج
        if (title) {
            const existingProduct = await Product.findOne({ title });
            if (existingProduct && existingProduct._id.toString() !== id) {
                return res.status(400).json({ message: "Product already exists" });
            }
            product.title = title;
            product.slug = slugify(title, { lower: true, replacement: "_" });
        }

        // باقي الحقول
        if (description) product.description = description;
        if (specs) product.specs = typeof specs === "string" ? JSON.parse(specs) : specs;
        if (badges) product.badges = typeof badges === "string" ? JSON.parse(badges) : badges;

        // تعديل الـ Variants
        if (variants) {
            const parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;

            for (let i = 0; i < parsedVariants.length; i++) {
                const variant = parsedVariants[i];

                const imageFiles = req.files?.[`variantImages_${i}`];

                if (imageFiles && imageFiles.length > 0) {
                    const variantImages = [];

                    for (let j = 0; j < imageFiles.length; j++) {
                        const file = imageFiles[j];
                        const imageCustomId = nanoid(4);
                        const uploadResult = await cloudinaryConfig().uploader.upload(file.path, {
                            folder: `${process.env.UPLOADS_FOLDER}/products/${product._id}/variants/${i}/img_${imageCustomId}`,
                        });

                        variantImages.push({
                            customId: imageCustomId,
                            urls: {
                                secure_url: uploadResult.secure_url,
                                public_id: uploadResult.public_id
                            }
                        });
                    }

                    variant.images = variantImages;
                }
            }

            product.variants = parsedVariants;
        }

        await product.save();

        return res.status(200).json({
            message: "Product updated successfully",
            data: product,
        });

    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};



// delete product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // التحقق من وجود ID
        if (!id) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // حذف صور كل variant
        for (const variant of product.variants) {
            if (variant.images && variant.images.length > 0) {
                for (const image of variant.images) {
                    const publicId = image.urls?.public_id;
                    if (publicId) {
                        await cloudinaryConfig().uploader.destroy(publicId);
                    }
                }
            }
        }

        // حذف المنتج من قاعدة البيانات
        await Product.findByIdAndDelete(id);

        return res.status(200).json({ message: "Product deleted successfully" });

    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};



export const getRecommendedProducts = async (req, res) => {
    try {
        const { productId } = req.params;

        const currentProduct = await Product.findById(productId);
        if (!currentProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        const recommended = await Product.find({
            category: currentProduct.category,
            _id: { $ne: productId }
        }).limit(6);

        res.status(200).json({
            message: "Recommended products fetched",
            recommended
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// get product by id
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id)
            .populate("category", "name slug")
            .populate("subCategory", "name slug")
            .populate("createdBy", "name email");

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({
            message: "Product fetched successfully",
            data: product
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

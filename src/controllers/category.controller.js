import slugify from "slugify";
import { cloudinaryConfig } from "../utilites/cloudinary.utilites.js";
import { nanoid } from "nanoid";
import { Category } from "../models/category.models.js";

export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists" });
        }
        const slug = slugify(name, {
            lower: true,
            replacement: "_",
        });

        if (!req.file) {
            return res.status(400).json({ message: "Image is required" });
        }

        // upload image to cloudinary

        const customId = nanoid(4);
        const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(req.file.path, {
            folder: `${process.env.UPLOADS_FOLDER}/categories/${customId}`,

        });
        const category = {
            name,
            slug,
            images: [
                {
                    public_id,
                    secure_url,
                },
            ],
            customId,
            createBy: req.authuser._id, // Assuming req.authuser is set by auth middleware
        };


        const newCategory = await Category.create(category);
        // Populate subCategories to return their names/slugs/customIds
        newCategory.subCategories = [];
        res.status(201).json({
            message: "Category created successfully",
            data: newCategory,
        });


    } catch (error) {

    }
}

// get gategory

export const getCategory = async (req, res) => {
    try {

        const { id, name, slug } = req.query;
        const query = {};
        if (id) {
            query._id = id;
        }
        if (name) {
            query.name = name;
        }
        if (slug) {
            query.slug = slug;
        }
        // const categories = await Category.find(query);
        const categories = await Category.find(query).populate("subCategories", "name slug customId");
        if (categories.length === 0) {
            return res.status(404).json({ message: "No categories found" });
        }
        res.status(200).json({
            message: "Categories fetched successfully",
            data: categories,
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });

    }
}


// update category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Category ID is required" });
        }

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        if (name) {
            category.name = name;
            category.slug = slugify(name, {
                lower: true,
                replacement: "_",
            });
        }

        if (req.file) {
            const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(req.file.path, {
                folder: `${process.env.UPLOADS_FOLDER}/categories/${category.customId}`,
            });
            category.images.push({ public_id, secure_url });
        }

        const updatedCategory = await category.save();
        res.status(200).json({
            message: "Category updated successfully",
            data: updatedCategory,
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });

    }
}

// delete category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Category ID is required" });
        }

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        // Delete images from cloudinary
        for (const image of category.images) {
            await cloudinaryConfig().uploader.destroy(image.public_id);
        }
        // Delete category from database


        await Category.findByIdAndDelete(id);

        res.status(200).json({ message: "Category deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });

    }
}

// get categories with subcategories
export const getCategoriesWithSubCategories = async (req, res) => {
    try {
        const categories = await Category.aggregate([
            {
                $lookup: {
                    from: 'subcategories',
                    localField: '_id',
                    foreignField: 'categoryId',
                    as: 'subCategories'
                }
            }
        ]);

        if (categories.length === 0) {
            return res.status(404).json({ message: "No categories found" });
        }

        res.status(200).json({
            message: "Categories with subcategories fetched successfully",
            data: categories,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

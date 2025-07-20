// create subCategory
import { SubCategory } from "../models/subCategory.model.js";
import slugify from "slugify";
import { cloudinaryConfig } from "../utilites/cloudinary.utilites.js";
import { nanoid } from "nanoid";
import { Category } from "../models/category.models.js";

export const createSubCategory = async (req, res) => {
    try {
        // check categoryId

        const category = await Category.findById(req.query.categoryId);
        if (!category) {
            return res.status(400).json({ message: "Category not found" });
        }
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        const existingSubCategory = await SubCategory.findOne({ name });
        if (existingSubCategory) {
            return res.status(400).json({ message: "SubCategory already exists" });
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
            folder: `${process.env.UPLOADS_FOLDER}/categories/${category.customId}/subCategories/${customId}`,

        });

        // create subCategory object
        const subCategory = {
            name,
            slug,
            customId,
            images: { public_id, secure_url },
            categoryId: category,
            createBy: req.authuser._id, // Assuming req.authuser is set by auth middleware

        };
        let newSubCategory = await SubCategory.create(subCategory);
        category.subCategories.push(newSubCategory._id);
        await category.save();

        // Populate categoryId to return its name/slug/customId
        newSubCategory = await SubCategory.findById(newSubCategory._id)
            .populate("categoryId", "name slug customId");

        res.status(200).json({ message: "SubCategory created successfully", data: newSubCategory });



    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });

    }

}


// get subCategory by id,name,slug
export const getSubCategory = async (req, res) => {
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
        const subCategories = await SubCategory.find(query);
        res.status(200).json({
            message: "SubCategories fetched successfully",
            data: subCategories,
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });

    }
}


// update subCategory
export const updateSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!id) {
            return res.status(400).json({ message: "SubCategory ID is required" });
        }

        const subCategory = await SubCategory.findById(id);
        if (!subCategory) {
            return res.status(404).json({ message: "SubCategory not found" });
        }

        if (name) {
            const existingSubCategory = await SubCategory.findOne({ name });
            if (existingSubCategory) {
                return res.status(400).json({ message: "SubCategory already exists" });
            }
            subCategory.name = name;
            subCategory.slug = slugify(name, {
                lower: true,
                replacement: "_",
            });
        }

        if (req.file) {
            const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(req.file.path, {
                folder: `${process.env.UPLOADS_FOLDER}/categories/${subCategory.categoryId}/subCategories/${subCategory.customId}`,
            });
            subCategory.images.public_id = public_id;
            subCategory.images.secure_url = secure_url;
        }

        const updatedSubCategory = await subCategory.save();
        res.status(200).json({ message: "SubCategory updated successfully", data: updatedSubCategory });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }

}

// delete subCategory
export const deleteSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "SubCategory ID is required" });
        }

        // بنستخدم اسم العلاقة الصح من الـ schema: categoryId
        const subCategory = await SubCategory.findById(id).populate("categoryId");
        if (!subCategory) {
            return res.status(404).json({ message: "SubCategory not found" });
        }

        const subCategoryPath = `${process.env.UPLOADS_FOLDER}/categories/${subCategory.categoryId.customId}/subCategories/${subCategory.customId}`;

        // حذف الصور من Cloudinary
        await cloudinaryConfig().api.delete_resources_by_prefix(subCategoryPath);
        await cloudinaryConfig().api.delete_folder(subCategoryPath);

        console.log("categoryId from populate:", subCategory.categoryId);

        // حذف الـ SubCategory من DB
        await SubCategory.findByIdAndDelete(id);

        res.status(200).json({ message: "SubCategory deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// get all subCategory in a category
export const getSubCategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        if (!categoryId) {
            return res.status(400).json({ message: "Category ID is required" });
        }

        const subCategories = await SubCategory.find({ categoryId }).populate("categoryId", "name slug customId");
        res.status(200).json({
            message: "SubCategories fetched successfully",
            data: subCategories,
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
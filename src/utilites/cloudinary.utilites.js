
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

export const cloudinaryConfig = () => {

    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET// Click 'View API Keys' above to copy your API secret
    });
    return cloudinary
}

export const uploadFile = async ({ file, folder = "General", publicId }) => {
    if (!file) {
        throw new Error("Please upload an image");
    }

    let options = { folder };
    if (publicId) {
        options.public_id = publicId;
    }

    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
        file,
        options
    );

    return { secure_url, public_id };
};
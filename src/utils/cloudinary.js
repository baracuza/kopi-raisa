const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'kopiraisa',
            use_filename: true,
            unique_filename: false,
            overwrite: true,
        });
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

module.exports = {
    uploadImage,
};
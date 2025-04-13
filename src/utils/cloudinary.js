const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Mengekstrak public_id dari URL Cloudinary
 * Contoh URL: https://res.cloudinary.com/demo/image/upload/v1234567890/konten-kopiraisa/1713100000000_image.jpg
 * Akan menghasilkan: konten-kopiraisa/1713100000000_image
 */
const getPublicIdFromUrl = (url) => {
    try {
        const baseUrl = 'res.cloudinary.com/';
        const splitUrl = url.split(baseUrl);
        if (splitUrl.length < 2) return null;

        const pathWithVersion = splitUrl[1].split('/');
        const uploadIndex = pathWithVersion.findIndex(part => part === 'upload');
        if (uploadIndex === -1 || uploadIndex + 1 >= pathWithVersion.length) return null;

        // Ambil semua bagian setelah "upload/" sampai sebelum ekstensi
        const publicIdParts = pathWithVersion.slice(uploadIndex + 1);
        const filenameWithExt = publicIdParts.pop();
        const filename = filenameWithExt.substring(0, filenameWithExt.lastIndexOf('.'));
        publicIdParts.push(filename);

        return publicIdParts.join('/');
    } catch (error) {
        console.error('Gagal mengambil public_id dari URL:', error.message);
        return null;
    }
};

const extractPublicId = getPublicIdFromUrl; // alias agar bisa digunakan dengan nama berbeda juga


/**
 * Menghapus file dari Cloudinary berdasarkan URL
 */
const deleteFromCloudinaryByUrl = async (fileUrl) => {
    const publicId = getPublicIdFromUrl(fileUrl);
    if (publicId) {
        try {
            await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
        } catch (error) {
            console.error('Gagal rollback Cloudinary:', error.message);
        }
    }
};

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
    cloudinary,
    uploadImage,
    deleteFromCloudinaryByUrl,
    getPublicIdFromUrl,
    extractPublicId
};
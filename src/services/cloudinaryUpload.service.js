const {cloudinary} = require('../utils/cloudinary');

const uploadToCloudinary = (filebuffer, filename) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'konten-kopiraisa', resource_type: 'auto', public_id: `${Date.now()}_${filename}` },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        stream.end(filebuffer);
    });
};

module.exports = {uploadToCloudinary};
const multer = require('multer');
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed: ${file.originalname}`), false);
    }
};

const upload = multer({
    storage, limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5,
    },
    fileFilter
});


module.exports = upload;
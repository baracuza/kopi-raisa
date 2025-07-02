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
        cb(new Error(`File type not allowed for field: ${file.fieldname}, File: ${file.originalname}`), false);
    }
};

const upload = multer({
    storage, limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5,
    },
    fileFilter
});
const uploadCompany = multer({
    storage, limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5,
    },
    fileFilter
});

// Upload untuk News: mendukung hingga 4 file media dan 1 thumbnail
const uploadNews = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Maksimal 5MB per file
        files: 5, // Maksimal 5 file dalam satu request (media + thumbnail)
    },
    fileFilter: (req, file, cb) => {
        // Filter file untuk media dan thumbnail (hanya gambar)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('ALLOWED_FILE_TYPES'), false);
        }
        cb(null, true);
    }
});

// Upload untuk Product: mendukung 1 file produk
const uploadProduct = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Maksimal 5MB per file
    },
    fileFilter: (req, file, cb) => {
        // Filter file untuk produk (hanya gambar)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('ALLOWED_FILE_TYPES'), false);
        }
        cb(null, true);
    }
});

module.exports = upload;
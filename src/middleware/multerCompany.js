
const multer = require('multer');

/**
 * Konfigurasi penyimpanan di memori.
 * File akan disimpan di req.file.buffer.
 */
const storage = multer.memoryStorage();

/**
 * Filter untuk memvalidasi tipe file.
 * Hanya menerima file dengan tipe gambar.
 */
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        // Terima file
        cb(null, true);
    } else {
        // Tolak file dan kirim error
        // Error ini akan ditangkap oleh multerErrorHandler
        cb(new Error('Tipe file tidak diizinkan! Hanya file gambar (JPEG, PNG, JPG, WEBP) yang diperbolehkan.'), false);
    }
};

/**
 * Instance multer yang dikonfigurasi khusus untuk upload gambar company.
 * Mengharapkan satu file dengan nama field 'image'.
 */
const uploadCompanyImage = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Batas ukuran file 5MB
    },
    fileFilter: fileFilter,
});

module.exports = uploadCompanyImage;

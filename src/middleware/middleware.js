const prisma = require('../db');
const jwt = require('jsonwebtoken');
const multer = require('multer');


//*⁡⁣⁢⁡⁣⁢⁣​‌‍‌‍middleware mengambil data user yang sedang login dengan cookie​⁡⁡*//
const authMiddleware = async (req, res, next) => {
    // console.log('Headers:', req.headers);
    const authHeader = req.cookies.token;
    try {

        console.log('Cookies:', req.cookies); // <--- ini penting

        if (!authHeader) {
            return res.status(401).json({ message: '*Access Denied / Tidak ada token' });
        }

        const verify = jwt.verify(authHeader, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: verify.id }
        });

        if (!user) {
            return res.status(404).json({ message: '*User tidak ditemukan!' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: '*Token invalid atau sudah kadaluwarsa!' });
    }
};

const validateProfilMedia = (req, res, next) => {
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    if (!req.file) {
        return next();
    }

    if (req.file.size > maxSizeBytes) {
        return res.status(400).json({
            message: 'Validasi gagal!',
            errors: {
                media: `*Ukuran file maksimal ${maxSizeMB}MB`
            }
        });
    }

    if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
            message: 'Validasi gagal!',
            errors: {
                media: '*Hanya file gambar (jpg, jpeg, png, webp)'
            }
        });
    }

    next();
};


const validateInsertNewsMedia = (req, res, next) => {
    const maxFiles = 5;
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    req.files = req.files || {};
    req.mediaValidationErrors = {}; // Inisialisasi error object

    // Validasi 'thumbnail'
    const thumbnailFile = req.files['thumbnail']?.[0] || null;

    if (!thumbnailFile) {
        req.mediaValidationErrors.thumbnail = '*Sampul wajib diunggah';
    } else {
        if (!allowedTypes.includes(thumbnailFile.mimetype)) {
            req.mediaValidationErrors.thumbnail = '*Sampul hanya boleh berupa gambar (jpg, jpeg, png, webp)';
        } else if (thumbnailFile.size > maxSizeBytes) {
            req.mediaValidationErrors.thumbnail = `*Ukuran sampul maksimal ${maxSizeMB}MB`;
        }
    }

    // Validasi 'media'
    const mediaFiles = req.files['media'] || [];
    if (mediaFiles.length > 0) {
        if (mediaFiles.length > maxFiles) {
            req.mediaValidationErrors.media = `*Maksimal hanya ${maxFiles} file yang diperbolehkan`;
        }

        const invalidFiles = mediaFiles.filter(file => !allowedTypes.includes(file.mimetype));
        if (invalidFiles.length > 0) {
            req.mediaValidationErrors.media = '*Hanya file gambar (jpg, jpeg, png, webp) yang diperbolehkan';
        }

        const oversizedFiles = mediaFiles.filter(file => file.size > maxSizeBytes);
        if (oversizedFiles.length > 0) {
            req.mediaValidationErrors.media = `*Ukuran setiap file maksimal ${maxSizeMB}MB`;
        }

        const totalSize = mediaFiles.reduce((acc, file) => acc + file.size, 0);
        const maxTotalSize = 27 * 1024 * 1024; // 20MB
        if (totalSize > maxTotalSize) {
            req.mediaValidationErrors.media = '*Total ukuran file tidak boleh lebih dari 25MB';
        }
    }

    next();
};


const validateUpdateNewsMedia = (options = {}) => {
    return (req, res, next) => {
        const { skipIfNoFile = false } = options;

        const maxFiles = 5;
        const maxSizeMB = 5;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

        req.files = req.files || {};
        req.mediaValidationErrors = {};

        const thumbnailFile = req.files['thumbnail']?.[0] || null;
        const mediaFiles = req.files['media'] || [];

        const noThumbnail = !thumbnailFile;
        const noMedia = mediaFiles.length === 0;
        if (skipIfNoFile && noThumbnail && noMedia) {
            return next();
        }

        // Validasi thumbnail
        if (thumbnailFile) {
            if (!allowedTypes.includes(thumbnailFile.mimetype)) {
                req.mediaValidationErrors.thumbnail = '*Sampul hanya boleh berupa gambar (jpg, jpeg, png, webp)';
            } else if (thumbnailFile.size > maxSizeBytes) {
                req.mediaValidationErrors.thumbnail = `*Ukuran sampul maksimal ${maxSizeMB}MB`;
            }
        }

        // Validasi media
        if (mediaFiles.length > maxFiles) {
            req.mediaValidationErrors.media = `*Maksimal hanya ${maxFiles} file yang diperbolehkan`;
        }

        const invalidMediaFiles = mediaFiles.filter(file => !allowedTypes.includes(file.mimetype));
        if (invalidMediaFiles.length > 0) {
            req.mediaValidationErrors.media = '*Hanya file gambar (jpg, jpeg, png, webp) yang diperbolehkan';
        }

        const oversizedMediaFiles = mediaFiles.filter(file => file.size > maxSizeBytes);
        if (oversizedMediaFiles.length > 0) {
            req.mediaValidationErrors.media = `*Ukuran setiap file maksimal ${maxSizeMB}MB`;
        }

        next(); // lanjut ke handleValidationResult + handleValidationResultFinal
    };
};

const validateProductMedia = (req, res, next) => {
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    req.files = req.files || {};
    req.mediaValidationErrors = {}; // Inisialisasi error object


    // Validasi 'media'
    const mediaFile = req.files['productFile'] || [];
    if (!mediaFile) {
        req.mediaValidationErrors.media = '*Gambar produk wajib diunggah';
    } else {
        if (!allowedTypes.includes(mediaFile.mimetype)) {
            req.mediaValidationErrors.media = '*Gambar produk hanya boleh berupa gambar (jpg, jpeg, png, webp)';
        } else if (mediaFile.size > maxSizeBytes) {
            req.mediaValidationErrors.media = `*Ukuran gambar produk maksimal ${maxSizeMB}MB`;
        }
    }

    next();
}

const multerErrorHandler = (err, req, res, next) => {
    console.error('Multer Error:', err);
    if (err instanceof multer.MulterError) {
        let field = err.field || 'media'; // Ambil nama field dari error
        switch (err.code) {
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    message: 'Validasi gagal!',
                    errors: {
                        [field]: '*Jumlah file yang diunggah melebihi batas'
                    }
                });
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    message: 'Validasi gagal!',
                    errors: {
                        [field]: '*Ukuran per file maksimal 5MB'
                    }
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    message: 'Validasi gagal!',
                    errors: {
                        [field]: '*terlalu banyak file yang diunggah'
                    }
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    message: 'Validasi gagal!',
                    errors: {
                        [field]: '*terlalu banyak yang diunggah, Maksimal 4 file yang diperbolehkan'
                    }
                });
            case 'ALLOWED_FILE_TYPES':
                return res.status(400).json({
                    message: 'Validasi gagal!',
                    errors: {
                        [field]: '*Hanya file gambar (jpg, jpeg, png, webp) yang diperbolehkan'
                    }
                });
            default:
                return res.status(400).json({
                    message: 'Upload gagal',
                    error: err.message
                });
        }
    }

    // Tangani juga error umum lain dari multer
    if (err.message === 'Unexpected field') {
        return res.status(400).json({
            message: 'Upload gagal',
            errors: {
                media: '*Hanya boleh mengunggah file pada field yang sesuai'
            }
        });
    }

    // Kalau bukan error dari multer, lanjut ke global error handler
    next(err);
};








module.exports = { authMiddleware, validateUpdateNewsMedia, validateInsertNewsMedia, multerErrorHandler, validateProfilMedia, validateProductMedia };
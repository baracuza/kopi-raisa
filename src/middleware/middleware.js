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
            return res.status(401).json({ message: '*Access Denied / Tidak dapat mengakses' });
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

    req.mediaValidationErrors = {};


    // Validasi 'media'
    const mediaFile = req.file;
    // console.log('mediaFile', mediaFile);
    if (!mediaFile || mediaFile === undefined) {
        req.mediaValidationErrors.productFile = '*Gambar produk wajib diunggah';
    } else {
        if (!allowedTypes.includes(mediaFile.mimetype)) {
            req.mediaValidationErrors.productFile = '*Gambar produk hanya boleh berupa gambar (jpg, jpeg, png, webp)';
        }
        else if (mediaFile.size > maxSizeBytes) {
            req.mediaValidationErrors.productFile = `*Ukuran gambar produk maksimal ${maxSizeMB}MB`;
        }

    }
    next();
}

const validateAboutCompanyMedia = (req, res, next) => {
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    // Selalu inisialisasi objek error di request
    req.mediaValidationErrors = {};

    const mediaFile = req.file;
    const fieldName = 'imageCompany'; // Nama field yang benar untuk company

    // 1. Cek apakah file wajib diunggah
    if (!mediaFile) {
        req.mediaValidationErrors[fieldName] = '*Gambar perusahaan wajib diunggah';
    } else {
        // 2. Jika file ada, validasi tipe filenya
        if (!allowedTypes.includes(mediaFile.mimetype)) {
            req.mediaValidationErrors[fieldName] = '*Gambar perusahaan hanya boleh berupa (jpg, jpeg, png, webp)';
        }
        // 3. Jika tipe file benar, validasi ukurannya
        else if (mediaFile.size > maxSizeBytes) {
            req.mediaValidationErrors[fieldName] = `*Ukuran gambar perusahaan maksimal ${maxSizeMB}MB`;
        }
    }

    // Lanjutkan ke middleware berikutnya (misalnya, handleValidationResult)
    next();
};

const validateProductUpdate = (options = {}) => {
    return (req, res, next) => {
        const { skipIfNoFile = false } = options;

        const maxSizeMB = 5;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

        req.mediaValidationErrors = {};
        const mediaFile = req.file;

        const noMedia = !mediaFile;
        if (skipIfNoFile && noMedia) {
            return next();
        }

        if (mediaFile) {
            if (!allowedTypes.includes(mediaFile.mimetype)) {
                req.mediaValidationErrors.productFile = '*Gambar produk hanya boleh berupa gambar (jpg, jpeg, png, webp)';
            } else if (mediaFile.size > maxSizeBytes) {
                req.mediaValidationErrors.productFile = `*Ukuran gambar produk maksimal ${maxSizeMB}MB`;
            }
        }
        next();
    }
}
const validateUpdateCompanyMedia = (req, res, next) => {
    // Jika tidak ada file yang diunggah, lewati validasi dan lanjutkan
    if (!req.file) {
        return next();
    }

    // Jika ada file, jalankan validasi seperti biasa
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const fieldName = 'imageCompany';

    // Inisialisasi objek error jika belum ada
    req.mediaValidationErrors = req.mediaValidationErrors || {};

    const mediaFile = req.file;

    // Validasi tipe file
    if (!allowedTypes.includes(mediaFile.mimetype)) {
        req.mediaValidationErrors[fieldName] = '*Gambar perusahaan hanya boleh berupa (jpg, jpeg, png, webp)';
    }
    // Validasi ukuran file
    else if (mediaFile.size > maxSizeBytes) {
        req.mediaValidationErrors[fieldName] = `*Ukuran gambar perusahaan maksimal ${maxSizeMB}MB`;
    }

    // Lanjutkan ke middleware berikutnya
    next();
};

const multerErrorHandler = (err, req, res, next) => {
    console.error('Multer Error:', err);

    // Tangani error kustom dari fileFilter
    if (err instanceof Error && err.message.startsWith('File type not allowed for field:')) {
        // Ekstrak field dan nama file dari pesan error
        const match = err.message.match(/field: (\w+), File: (.+)$/);
        const field = match?.[1] || 'file';
        const filename = match?.[2] || '';

        return res.status(400).json({
            message: 'Validasi gagal!',
            errors: {
                [field]: `*Tipe file tidak diizinkan: ${filename}`
            }
        });
    }

    // Tangani error bawaan dari Multer
    if (err instanceof multer.MulterError) {
        let errorMessage = '';
        let field = err.field || 'file';

        switch (err.code) {
            case 'LIMIT_FILE_COUNT':
                errorMessage = '*Jumlah file yang diunggah melebihi batas';
                break;
            case 'LIMIT_FILE_SIZE':
                errorMessage = '*Ukuran per file maksimal 5MB';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                errorMessage = '*Terlalu banyak file yang diunggah';
                break;
            default:
                errorMessage = '*Terjadi kesalahan dalam pengunggahan file';
        }

        return res.status(400).json({
            message: 'Validasi gagal!',
            errors: {
                [field]: errorMessage
            }
        });
    }

    // Jika tidak ada file dan file wajib diunggah
    if (!req.file && !req.files && (req.baseUrl.includes('product') || req.baseUrl.includes('news'))) {
        const fallbackField = req.baseUrl.includes('news') ? 'media' :
            req.baseUrl.includes('product') ? 'productFile' : 'file';
        return res.status(400).json({
            message: 'Validasi gagal!',
            errors: {
                [fallbackField]: '*File wajib diunggah'
            }
        });
    }

    // Jika bukan error multer, teruskan ke error handler berikutnya
    next(err);
};

const companyMulterErrorHandler = (err, req, res, next) => {
    const fieldName = 'imageCompany'; // Nama field spesifik untuk company

    // Tangani error bawaan dari Multer (misal: ukuran file terlalu besar)
    if (err instanceof multer.MulterError) {
        let errorMessage = '*Terjadi kesalahan dalam pengunggahan file';

        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                errorMessage = `*Ukuran file untuk gambar perusahaan maksimal 5MB`;
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                errorMessage = `*Field file tidak terduga, gunakan '${fieldName}'`;
                break;
        }
        return res.status(400).json({
            message: 'Validasi gagal!',
            errors: { [fieldName]: errorMessage }
        });
    }

    // Tangani error kustom dari fileFilter (tipe file tidak diizinkan)
    if (err) {
        return res.status(400).json({
            message: 'Validasi gagal!',
            errors: { [fieldName]: err.message } // Menggunakan pesan error dari multer
        });
    }

    // Jika bukan error dari multer, lanjutkan ke middleware berikutnya
    next();
};





module.exports = {
    authMiddleware, validateUpdateNewsMedia, validateInsertNewsMedia, multerErrorHandler, validateProfilMedia,
    validateProductMedia, validateProductUpdate, validateAboutCompanyMedia, companyMulterErrorHandler, validateUpdateCompanyMedia
};
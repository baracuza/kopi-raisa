const { body, validationResult } = require('express-validator');
const validator = require('validator');
const multer = require('multer');

const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('*Nama wajib diisi')
        .isLength({ min: 3, max: 50 }).withMessage('*Nama harus lebih dari 3 karakter'),

    body('email')
        .trim()
        .notEmpty().withMessage('*Email wajib diisi')
        .custom((value) => {
            if (!validator.isEmail(value)) {
                throw new Error('*Format email tidak valid');
            }
            return true;
        }),

    body('password')
        .trim()
        .notEmpty().withMessage('*Password wajib diisi')
        .isLength({ min: 6 }).withMessage('*Password minimal 6 karakter'),

    body('phone_number')
        .trim()
        .notEmpty().withMessage('*Nomor telepon wajib diisi')
        .custom((value) => {
            if (!validator.isMobilePhone(value, 'id-ID')) {
                throw new Error('*Format nomor telepon tidak valid');
            }
            if (!validator.isNumeric(value)) {
                throw new Error('*Nomor telepon harus berupa angka');
            }
            if (value.length < 10 || value.length > 15) {
                throw new Error('*Nomor telepon kurang dari 11 digit');
            }
            return true;
        }),
];

const validateUpdateProfile = [
    body('name')
        .trim()
        .notEmpty().withMessage('*Nama wajib diisi')
        .isLength({ min: 3, max: 50 }).withMessage('*Nama harus lebih dari 3 karakter'),

    body('phone_number')
        .trim()
        .notEmpty().withMessage('*Nomor telepon wajib diisi')
        .custom((value) => {
            if (!validator.isMobilePhone(value, 'id-ID')) {
                throw new Error('*Format nomor telepon tidak valid');
            }
            if (!validator.isNumeric(value)) {
                throw new Error('*Nomor telepon harus berupa angka');
            }
            if (value.length < 10 || value.length > 15) {
                throw new Error('*Nomor telepon kurang dari 11 digit');
            }
            return true;
        }),
];

const validateLogin = [
    body('emailOrPhone')
        .trim()
        .notEmpty().withMessage('*Masukkan email atau nomor telepon ')
        .custom((value) => {
            const isValidEmail = validator.isEmail(value);
            const isValidPhone = validator.isMobilePhone(value, 'id-ID');
            if (!isValidEmail && !isValidPhone) {
                throw new Error('*Masukkan email atau nomor telepon yang valid');
            }
            return true;
        }),

    body('password')
        .trim()
        .notEmpty().withMessage('*Password wajib diisi')
        .isLength({ min: 6 }).withMessage('*Password minimal 6 karakter')
];


const validateInsertNewsData = [
    // Validasi untuk title
    body("title")
        .notEmpty().withMessage("*Judul wajib diisi")
        .isLength({ max: 255 }).withMessage("*Judul maksimal 255 karakter"),

    // Validasi untuk content
    body("content")
        .notEmpty().withMessage("*Konten/deskripsi wajib diisi data")
        .custom((value) => {
            const stripped = value.replace(/<[^>]*>/g, "").replace(/\s|&nbsp;/g, "");
            if (!stripped) {
                throw new Error("*Konten/deskripsi tidak boleh kosong data");
            }
            return true;
        }),

    // Validasi total karakter gabungan title + content
    body("content").custom((_, { req }) => {
        const title = req.body.title || "";
        const content = req.body.content || "";

        const text = `${title} ${content}`
            .replace(/<[^>]+>/g, "")
            .replace(/\s+/g, " ")
            .trim();

        const charCount = text.length;

        if (charCount > 2200) {
            throw new Error("*Jumlah total karakter tidak boleh lebih dari 2200");
        }

        return true;
    }),

    // Middleware gabungan: validasi file + field
    (req, res, next) => {
        const errors = {};

        // --- VALIDASI FILE ---
        const maxFiles = 5;
        const maxSizeMB = 5;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

        const thumbnailFiles = Array.isArray(req.files?.['thumbnail']) ? req.files['thumbnail'] : [];
        const thumbnailFile = thumbnailFiles[0];

        if (!thumbnailFile) {
            errors.thumbnail = '*Sampul wajib diunggah';
        } else {
            if (!allowedTypes.includes(thumbnailFile.mimetype)) {
                errors.thumbnail = '*Sampul hanya boleh berupa gambar (jpg, jpeg, png, webp)';
            }
            if (thumbnailFile.size > maxSizeBytes) {
                errors.thumbnail = `*Ukuran sampul maksimal ${maxSizeMB}MB`;
            }
        }

        const mediaFiles = Array.isArray(req.files?.['media']) ? req.files['media'] : [];

        if (mediaFiles.length > maxFiles) {
            errors.media = `*Maksimal hanya ${maxFiles} file yang diperbolehkan`;
        }

        const invalidFiles = mediaFiles.filter(file => !allowedTypes.includes(file.mimetype));
        if (invalidFiles.length > 0) {
            errors.media = '*Hanya file gambar (jpg, jpeg, png, webp) yang diperbolehkan';
        }

        const oversizedFiles = mediaFiles.filter(file => file.size > maxSizeBytes);
        if (oversizedFiles.length > 0) {
            errors.media = `*Ukuran setiap file maksimal ${maxSizeMB}MB`;
        }

        const totalSize = mediaFiles.reduce((acc, file) => acc + file.size, 0);
        const maxTotalSize = 20 * 1024 * 1024;
        if (totalSize > maxTotalSize) {
            errors.media = '*Total ukuran file tidak boleh lebih dari 20MB';
        }

        // --- VALIDASI FIELD DARI express-validator ---
        const result = validationResult(req);
        if (!result.isEmpty()) {
            result.array().forEach(err => {
                errors[err.param] = err.msg;
            });
        }

        // --- Jika ada error apapun, balikan response ---
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                message: 'Validasi gagal!',
                errors
            });
        }

        next();
    }
];


// if (mediaFiles.length === 0) {
//     return next();
// }
const updateNewsValidator = [
    // Judul boleh dikirim, tapi jika ada harus valid
    body("title")
        .optional()
        .notEmpty().withMessage("*Judul tidak boleh kosong")
        .isLength({ max: 255 }).withMessage("*Judul maksimal 255 karakter"),

    // Konten boleh dikirim, tapi harus valid jika ada
    body("content")
        .optional()
        .custom((value) => {
            const stripped = value.replace(/<[^>]*>/g, "").replace(/\s|&nbsp;/g, "");
            if (!stripped) {
                throw new Error("*Konten/deskripsi tidak boleh kosong jika diisi");
            }
            return true;
        }),

    // Jika title dan/atau content diisi, cek total kata gabungan
    body("content").custom((_, { req }) => {
        const title = req.body.title || "";
        const content = req.body.content || "";

        // Kalau keduanya tidak diisi, validasi tetap lolos (karena PUT bisa parsial)
        if (!title && !content) return true;

        const text = `${title} ${content}`
            .replace(/<[^>]+>/g, "")
            .replace(/\s+/g, " ")
            .trim();

        const charCount = text.length;

        if (charCount > 2200) {
            throw new Error("*Jumlah total karakter tidak boleh lebih dari 2200");
        }

        return true;
    }),

    //postToFacebook & Instagram boolean opsional
    // body("postToFacebook")
    //     .optional()
    //     .isBoolean().withMessage("postToFacebook harus berupa boolean"),

    // body("postToInstagram")
    //     .optional()
    //     .isBoolean().withMessage("postToInstagram harus berupa boolean"),
];

module.exports = { validateRegister, validateLogin, validateInsertNewsData, updateNewsValidator, validateUpdateProfile };
const { body } = require('express-validator');
const validator = require('validator');

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
                throw new Error('*Panjang karakter Nomor telepon tidak valid');
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

const createNewsValidator = [
    // Title wajib, tidak boleh kosong, dan maksimal 255 karakter
    body("title")
        .trim()
        .notEmpty().withMessage("Judul wajib diisi")
        .isLength({ max: 90 }).withMessage("*Judul maksimal 90 karakter"),

    // Konten wajib dan harus berisi teks nyata (bukan hanya tag kosong)
    body("content")
        .notEmpty().withMessage("*Konten/deskripsi wajib diisi")
        .isLength({ max: 2110 }).withMessage("*Konten/deskripsi maksimal 2110 karakter")
        .custom((value) => {
            // Hilangkan tag HTML
            const stripped = value.replace(/<[^>]*>/g, "").replace(/\s|&nbsp;/g, "");
            if (!stripped) {
                throw new Error("*Konten/deskripsi tidak boleh kosong");
            }
            return true;
        }),
];

const updateNewsValidator = [
    // Judul boleh dikirim, tapi jika ada harus valid
    body("title")
        .optional()
        .notEmpty().withMessage("Judul tidak boleh kosong")
        .isLength({ max: 90 }).withMessage("Judul maksimal 90 karakter"),

    // Konten boleh dikirim, tapi harus valid jika ada
    body("content")
        .optional()
        .isLength({ max: 2110 }).withMessage("*Konten/deskripsi maksimal 2110 karakter")
        .custom((value) => {
            const stripped = value.replace(/<[^>]*>/g, "").replace(/\s|&nbsp;/g, "");
            if (!stripped) {
                throw new Error("Konten/deskripsi tidak boleh kosong");
            }
            return true;
        }),
];

const partnerValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('*Nama wajib diisi')
        .isLength({ min: 3, max: 50 }).withMessage('*Nama harus lebih dari 3 karakter'),

    body('owner_name')
        .trim()
        .notEmpty().withMessage('*Nama pemilik wajib diisi')
        .isLength({ min: 3, max: 50 }).withMessage('*Nama pemilik harus lebih dari 3 karakter'),

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
                throw new Error('*Panjang karakter Nomor telepon tidak valid');
            }
            return true;
        }),

    body('address')
        .optional()
        .isLength({ max: 255 }).withMessage('*Alamat maksimal 255 karakter'),
];

const productValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('*Nama produk wajib diisi')
        .isLength({ min: 3, max: 50 }).withMessage('*Nama produk harus lebih dari 3 karakter'),

    body('description')
        .trim()
        .notEmpty().withMessage('*Deskripsi produk wajib diisi')
        .isLength({ min: 10, max: 255 }).withMessage('*Deskripsi produk harus lebih dari 10 karakter'),

    body('price')
        .trim()
        .notEmpty().withMessage('*Harga produk wajib diisi')
        .isNumeric().withMessage('*Harga produk harus berupa angka'),

    body('stock')
        .trim()
        .notEmpty().withMessage('*Stok produk wajib diisi')
        .isNumeric().withMessage('*Stok produk harus berupa angka'),
];

module.exports = { validateRegister, validateLogin, createNewsValidator, updateNewsValidator, validateUpdateProfile, partnerValidator, productValidator };
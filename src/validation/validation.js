const { body, query } = require('express-validator');

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
        .isLength({ min: 9, max: 16 }).withMessage('*Panjang karakter Nomor telepon tidak valid')
        .custom((value) => {
            if (!/^(0|(\+62))[0-9]{8,13}$/.test(value)) {
                throw new Error('*Format nomor telepon tidak valid. Gunakan awalan 0 atau +62.');
            }
            return true;
        }),
    
];

const productValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('*Nama produk wajib diisi')
        .isLength({ min: 3, max: 50 }).withMessage('*Nama produk harus lebih dari 3 karakter'),

    body('description')
        .trim()
        .notEmpty().withMessage('*Deskripsi produk wajib diisi')
        .isLength({ min: 10, max: 1000 }).withMessage('*Deskripsi produk harus 10-1000 karakter'),

    body('price')
        .trim()
        .notEmpty().withMessage('*Harga produk wajib diisi')
        .isInt({ min: 0 }).withMessage('*Harga produk harus berupa angka'),

    body('stock')
        .trim()
        .notEmpty().withMessage('*Stok produk wajib diisi')
        .isInt({ min: 0 }).withMessage('*Stok produk harus berupa angka'),
    body('partner_id')
        .trim()
        .notEmpty().withMessage('*Partner tidak valid atau tidak boleh kosong'),
    body('weight')
        .trim()
        .notEmpty().withMessage('*Berat produk wajib diisi')
        .isInt({ min: 0 }).withMessage('*Berat produk harus berupa angka'),
];

const companyValidator = [
    body('titleCompany')
        .trim()
        .notEmpty().withMessage('*Nama perusahaan wajib diisi')
        .isLength({ min: 3, max: 255 }).withMessage('*Nama perusahaan harus 3-255 karakter'),
    body('descCompany')
        .trim()
        .notEmpty().withMessage('*Deskripsi perusahaan wajib diisi')
        .isLength({ min: 10, max: 1000 }).withMessage('*Deskripsi perusahaan harus lebih dari 10-1000 karakter'),
    body('descVisi')
        .trim()
        .notEmpty().withMessage('*Deskripsi visi perusahaan wajib diisi')
        .isLength({ min: 10, max: 1000 }).withMessage('*Deskripsi visi perusahaan harus lebih dari 10-1000 karakter'),
    body('descMisi')
        .trim()
        .notEmpty().withMessage('*Deskripsi misi perusahaan wajib diisi')
        .isLength({ min: 10, max: 1000 }).withMessage('*Deskripsi misi perusahaan harus lebih dari 10-1000 karakter'),
]

const orderValidator = [
    body('items')
        .isArray({ min: 1 }).withMessage('*Items tidak boleh kosong')
        .custom((value) => {
            for (const item of value) {
                if (!item.products_id || !item.quantity) {
                    throw new Error('*Semua item harus memiliki products_id, quantity, dan price');
                }
            }
            return true;
        }),

    body('address')
        .trim()
        .notEmpty().withMessage('*Alamat wajib diisi'),

    body('paymentMethod')
        .trim()
        .notEmpty().withMessage('*Metode pembayaran wajib diisi'),

    body('cost')
        .trim()
        .notEmpty().withMessage('*Biaya pengiriman wajib diisi')
        .isNumeric().withMessage('*Biaya pengiriman harus berupa angka'),

    body('shipping_name')
        .trim()
        .notEmpty().withMessage('*Kurir wajib dipilih'),

    body('shipping_code')
        .trim()
        .notEmpty().withMessage('*Kode kurir wajib diisi'),

    body('shipping_service')
        .trim()
        .notEmpty().withMessage('*Layanan kurir wajib diisi'),
    
    body('destination_id')
        .trim()
        .notEmpty().withMessage('*ID tujuan wajib diisi')
        .isNumeric().withMessage('*ID tujuan harus berupa angka'),

    body('destination_province')
        .trim()
        .notEmpty().withMessage('*Provinsi tujuan wajib diisi')
        .isLength({ min: 3, max: 500 }).withMessage('*Provinsi tujuan harus lebih dari 3 karakter'),

    body('destination_city')
        .trim()
        .notEmpty().withMessage('*Kota tujuan wajib diisi')
        .isLength({ min: 3, max: 500 }).withMessage('*Kota tujuan harus lebih dari 3 karakter'),

    body('destination_district')
        .trim()
        .notEmpty().withMessage('*Kecamatan tujuan wajib diisi')
        .isLength({ min: 3, max: 500 }).withMessage('*Kecamatan tujuan harus lebih dari 3 karakter'),

    body('destination_subdistrict')
        .trim()
        .notEmpty().withMessage('*Kelurahan/Desa tujuan wajib diisi')
        .isLength({ min: 3, max: 500 }).withMessage('*Kelurahan tujuan harus lebih dari 3 karakter'),

    body('destination_pos_code')
        .trim()
        .notEmpty().withMessage('*Kode pos tujuan wajib diisi')
        .isNumeric().withMessage('*Kode pos tujuan harus berupa angka'),
    
    
];

const validateQueryDomestic = [
    query('search')
        .notEmpty().withMessage('Masukkan parameter alamat untuk pencarian')
        .isString().withMessage('Parameter alamat untuk pencarian harus berupa teks.'),
];

const validateCost =[

    body('destination')
        .notEmpty().withMessage('Tujuan tidak boleh kosong')
        .isNumeric().withMessage('Tujuan harus berupa angka'),

    body('weight')
        .notEmpty().withMessage('Berat tidak boleh kosong')
        .isNumeric().withMessage('Berat harus berupa angka'),
]

module.exports = {
    validateRegister, validateLogin, createNewsValidator,
    updateNewsValidator, validateUpdateProfile, partnerValidator,
    productValidator, orderValidator, validateQueryDomestic,validateCost,
    companyValidator
};
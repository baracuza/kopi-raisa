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

const createNewsValidator = [

    // Title wajib, tidak boleh kosong, dan maksimal 255 karakter
    body("title")
        .notEmpty().withMessage("Judul wajib diisi")
        .isLength({ max: 255 }).withMessage("Judul maksimal 255 karakter"),

    // Konten wajib dan harus berisi teks nyata (bukan hanya tag kosong)
    body("content")
        .notEmpty().withMessage("Konten/deskripsi wajib diisi")
        .custom((value) => {
            // Hilangkan tag HTML
            const stripped = value.replace(/<[^>]*>/g, "").replace(/\s|&nbsp;/g, "");
            if (!stripped) {
                throw new Error("Konten/deskripsi tidak boleh kosong");
            }
            return true;
        }),

    // Validasi total kata dari title + content tidak melebihi 2200 kata
    body().custom((_, { req }) => {
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

    // postToFacebook & Instagram boleh ada, tapi harus boolean
    // body("postToFacebook")
    //     .optional()
    //     .isBoolean().withMessage("postToFacebook harus berupa boolean"),

    // body("postToInstagram")
    //     .optional()
    //     .isBoolean().withMessage("postToInstagram harus berupa boolean"),
];

const updateNewsValidator = [
    // Judul boleh dikirim, tapi jika ada harus valid
    body("title")
        .optional()
        .notEmpty().withMessage("Judul tidak boleh kosong")
        .isLength({ max: 255 }).withMessage("Judul maksimal 255 karakter"),

    // Konten boleh dikirim, tapi harus valid jika ada
    body("content")
        .optional()
        .custom((value) => {
            const stripped = value.replace(/<[^>]*>/g, "").replace(/\s|&nbsp;/g, "");
            if (!stripped) {
                throw new Error("Konten/deskripsi tidak boleh kosong jika diisi");
            }
            return true;
        }),

    // Jika title dan/atau content diisi, cek total kata gabungan
    body().custom((_, { req }) => {
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
            throw new Error("Jumlah total kata tidak boleh lebih dari 2200");
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

module.exports = { validateRegister, validateLogin, createNewsValidator, updateNewsValidator, validateUpdateProfile };
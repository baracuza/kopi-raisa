const { body } = require('express-validator');

const validateRegister = [
    body('name')
        // .isString().withMessage('Nama harus berupa teks')
        .isLength({ min: 3, max: 50 }).withMessage('*Nama harus antara 3-50 karakter'),

    body('email')
        .isEmail().withMessage('*Format email tidak valid'),

    body('password')
        .isLength({ min: 6 }).withMessage('*Password minimal 6 karakter'),

    // body('image')
    //     .optional(),
        // .isURL().withMessage('Gambar harus berupa URL valid'),

    body('phone_number')
        .isNumeric().withMessage('*Nomor telepon harus berupa angka')
        .isLength({ min: 10, max: 15 }).withMessage('*Nomor telepon harus lebih 10 digit'),
];

const validateLogin = [
    body('identifier')
        .notEmpty().withMessage('*Masukkan email atau nomor telepon '),

    body('password')
        .isLength({ min: 6 }).withMessage('*Password minimal 6 karakter')
];



module.exports = { validateRegister, validateLogin };
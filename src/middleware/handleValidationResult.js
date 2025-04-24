const { validationResult } = require("express-validator");

const handleValidationResult = (req, res, next) => {
    // Cek validasi express-validator (createNewsValidator)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.bodyValidationErrors = errors.mapped(); // simpan error ke request
    }

    // Cek validasi media (validateInsertNewsMedia) jika ada
    if (req.mediaValidationErrors) {
        // Gabungkan errors yang ada ke dalam bodyValidationErrors
        req.bodyValidationErrors = {
            ...req.bodyValidationErrors,
            ...req.mediaValidationErrors
        };
    }

    next(); // lanjutkan ke middleware selanjutnya
};

module.exports = handleValidationResult;

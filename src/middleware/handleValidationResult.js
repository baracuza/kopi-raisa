const { validationResult } = require("express-validator");

const handleValidationResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.bodyValidationErrors = errors.mapped(); // simpan error ke request
    }
    next(); // lanjutkan ke validasi lain (seperti validateInsertNewsMedia)
};

module.exports = handleValidationResult;

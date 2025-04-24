const { validationResult } = require('express-validator');

const handleValidationResult = (req, res, next) => {
    const result = validationResult(req);
    const bodyErrors = {};

    if (!result.isEmpty()) {
        result.array().forEach(err => {
            bodyErrors[err.param] = err.msg;
        });
    }

    const allErrors = {
        ...bodyErrors,
        ...(req.mediaValidationErrors || {})
    };

    if (Object.keys(allErrors).length > 0) {
        return res.status(400).json({
            message: 'Validasi gagal!',
            errors: allErrors
        });
    }

    next();
};

module.exports = handleValidationResult;

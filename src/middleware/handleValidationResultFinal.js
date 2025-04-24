const handleValidationResultFinal = (req, res, next) => {
    const errors = {
        ...req.bodyValidationErrors,
        ...req.mediaValidationErrors
    };

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            message: "Validasi gagal!",
            errors
        });
    }

    next();
};

module.exports = handleValidationResultFinal;

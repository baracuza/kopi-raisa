const handleValidationResultFinal = (req, res, next) => {
    // Gabungkan semua error menjadi satu objek
    const errors = {
        ...req.bodyValidationErrors,
        ...req.mediaValidationErrors
    };

    // Jika ada error, kembalikan response dengan status 400 dan pesan error
    if (Object.keys(errors).length > 0) {
        // Format error menjadi field-based: { field: error message }
        return res.status(400).json({
            message: "Validasi gagal!",
            errors: Object.keys(errors).reduce((acc, key) => {
                // Menyederhanakan error agar hanya berisi pesan yang mudah dipahami frontend
                acc[key] = errors[key].msg || errors[key];
                return acc;
            }, {})
        });
    }

    next();
};

module.exports = handleValidationResultFinal;

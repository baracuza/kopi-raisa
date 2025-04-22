const prisma = require('../db');
const jwt = require('jsonwebtoken');
const multer = require('multer');


//*⁡⁣⁢⁡⁣⁢⁣​‌‍‌‍middleware mengambil data user yang sedang login dengan cookie​⁡⁡*//
const authMiddleware = async (req, res, next) => {
    // console.log('Headers:', req.headers);
    const authHeader = req.cookies.token;
    try {

        console.log('Cookies:', req.cookies); // <--- ini penting

        if (!authHeader) {
            return res.status(401).json({ message: '*Access Denied / Tidak ada token' });
        }

        const verify = jwt.verify(authHeader, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: verify.id }
        });

        if (!user) {
            return res.status(404).json({ message: '*User tidak ditemukan!' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: '*Token invalid atau sudah kadaluwarsa!' });
    }
};

const validateProfilMedia = (req, res, next) => {
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    if (!req.file) {
        return next();
    }

    if (req.file.size > maxSizeBytes) {
        return res.status(400).json({
            message: 'Validasi gagal!',
            errors: {
                media: `*Ukuran file maksimal ${maxSizeMB}MB`
            }
        });
    }

    if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
            message: 'Validasi gagal!',
            errors: {
                media: '*Hanya file gambar (jpg, jpeg, png, webp)'
            }
        });
    }

    next();
};


const validateInsertNewsMedia = (req, res, next) => {
    const maxFiles = 5;
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    if (!req.files) {
        return next();
    }

    // Validasi untuk file 'media'
    const mediaFiles = req.files['media'] || [];
    if (mediaFiles.length === 0) {
        return next();
    }

    if (mediaFiles.length > maxFiles) {
        return res.status(400).json({
            message: 'Validasi gagal!',
            errors: {
                media: `*Maksimal hanya ${maxFiles} file yang diperbolehkan`
            }
        });
    }

    const invalidFiles = mediaFiles.filter(file => !allowedTypes.includes(file.mimetype));
    if (invalidFiles.length > 0) {
        return res.status(400).json({
            message: 'Validasi gagal!',
            errors: {
                media: '*Hanya file gambar (jpg, jpeg, png, webp) yang diperbolehkan'
            }
        });
    }

    const oversizedFiles = mediaFiles.filter(file => file.size > maxSizeBytes);
    if (oversizedFiles.length > 0) {
        return res.status(400).json({
            message: 'Validasi gagal!',
            errors: {
                media: `*Ukuran setiap file maksimal ${maxSizeMB}MB`
            }
        });
    }

    const totalSize = mediaFiles.reduce((acc, file) => acc + file.size, 0);
    const maxTotalSize = 20 * 1024 * 1024; // 20MB
    if (totalSize > maxTotalSize) {
        return res.status(400).json({
            message: 'Validasi gagal!',
            errors: {
                media: '*Total ukuran file tidak boleh lebih dari 20MB'
            }
        });
    }

    // Validasi untuk file 'thumbnail'
    const thumbnailFile = req.files['thumbnail']?.[0] || null;

    if (!thumbnailFile) {
        return res.status(400).json({
            message: 'Validasi gagal!',
            errors: {
                thumbnail: '*Sampul wajib diunggah'
            }
        });
    }

    if (!allowedTypes.includes(thumbnailFile.mimetype)) {
        return res.status(400).json({
            message: 'Validasi gagal!',
            errors: {
                thumbnail: '*Sampul hanya boleh berupa gambar (jpg, jpeg, png, webp)'
            }
        });
    }

    if (thumbnailFile.size > maxSizeBytes) {
        return res.status(400).json({
            message: 'Validasi gagal!',
            errors: {
                thumbnail: `*Ukuran sampul maksimal ${maxSizeMB}MB`
            }
        });
    }

    next();
};



const validateUpdateNewsMedia = (options = {}) => {

    return (req, res, next) => {
        const { skipIfNoFile = false } = options;

        const maxFiles = 5;
        const maxSizeMB = 5;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

        //Skip jika tidak ada file dan diminta skip validasi (misal saat update)
        if ((!req.files || req.files.length === 0) && skipIfNoFile) {
            return next();
        }

        // Cek jika tidak ada file yang diunggah
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: 'Validasi gagal!',
                errors: {
                    media: '*Minimal satu file gambar wajib diunggah'
                }
            });
        }

        // Cek jumlah maksimal file
        if (req.files.length > maxFiles) {
            return res.status(400).json({
                message: 'Validasi gagal!',
                errors: {
                    media: `*Maksimal hanya ${maxFiles} file yang diperbolehkan`
                }
            });
        }

        // Validasi tipe file
        const invalidFiles = req.files.filter(file => !allowedTypes.includes(file.mimetype));
        if (invalidFiles.length > 0) {
            return res.status(400).json({
                message: 'Validasi gagal!',
                errors: {
                    media: '*Hanya file gambar (jpg, jpeg, png, webp)'
                }
            });
        }

        // Validasi ukuran file
        const oversizedFiles = req.files.filter(file => file.size > maxSizeBytes);
        if (oversizedFiles.length > 0) {
            return res.status(400).json({
                message: 'Validasi gagal!',
                errors: {
                    media: `*Ukuran setiap file maksimal ${maxSizeMB}MB`
                }
            });
        }

        //validasi jumlah total ukuran file diupload
        const totalSize = req.files.reduce((acc, file) => acc + file.size, 0);
        const maxTotalSize = 20 * 1024 * 1024; // 20MB
        if (totalSize > maxTotalSize) {
            return res.status(400).json({
                message: 'Validasi gagal!',
                errors: {
                    media: '*Total ukuran file tidak boleh lebih dari 20MB'
                }
            });
        }

        next(); // lanjut ke controller
    };
};

const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    message: 'Validasi gagal!',
                    errors: {
                        media: '*Ukuran file maksimal 5MB'
                    }
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    message: 'Validasi gagal!',
                    errors: {
                        media: '*Jumlah file yang diunggah melebihi batas'
                    }
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    message: 'Validasi gagal!',
                    errors: {
                        media: '*terlalu banyak file yang diunggah'
                    }
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    message: 'Validasi gagal!',
                    errors: {
                        media: '*terlalu banyak yang diunggah, Maksimal 4 file yang diperbolehkan'
                    }
                });
            default:
                return res.status(400).json({
                    message: 'Upload gagal',
                    error: err.message
                });
        }
    }

    // Tangani juga error umum lain dari multer
    if (err.message === 'Unexpected field') {
        return res.status(400).json({
            message: 'Upload gagal',
            errors: {
                media: '*Hanya boleh mengunggah file pada field yang sesuai'
            }
        });
    }

    // Kalau bukan error dari multer, lanjut ke global error handler
    next(err);
};








module.exports = { authMiddleware, validateUpdateNewsMedia, validateInsertNewsMedia, multerErrorHandler, validateProfilMedia };
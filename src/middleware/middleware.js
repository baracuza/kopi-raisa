const prisma = require('../db');
const jwt = require('jsonwebtoken');


//*⁡⁣⁢⁡⁣⁢⁣​‌‍‌‍middleware mengambil data user yang sedang login dengan cookie​⁡⁡*//
const authMiddleware = async (req, res, next) => {
    // console.log('Headers:', req.headers);
    const authHeader = req.cookies.token;
    try {

        console.log('Cookies:', req.cookies); // <--- ini penting

        if (!authHeader) {
            return res.status(401).json({ message: 'Access Denied / Tidak ada token' });
        }

        const verify = jwt.verify(authHeader, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: verify.id }
        });

        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan!' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token invalid atau sudah kadaluwarsa!' });
    }
};

const validateNewsMedia = (req, res, next) => {
    const maxFiles = 5;
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];

    // Cek jika tidak ada file yang diunggah
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            message: 'Validasi gagal!',
            errors: {
                media: '*Minimal satu file gambar/video wajib diunggah'
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
                media: '*Hanya file gambar (jpg,jpeg, png, webp) atau video (mp4, mov) yang diperbolehkan'
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

const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'Validasi gagal!',
                errors: {
                    media: '*Ukuran setiap file maksimal 5MB'
                }
            });
        }

        // Tambahan: bisa juga tangani LIMIT_FILE_COUNT dll
        return res.status(400).json({ message: 'Upload gagal', error: err.message });
    }

    next(err); // lempar ke global error handler kalau bukan multer error
};







module.exports = { authMiddleware, validateNewsMedia, multerErrorHandler };
const prisma = require('../db');
const jwt = require('jsonwebtoken');

//*⁡⁣⁢​‌‍‌⁡⁣⁢⁣middleware tanpa cookie-user berhasil membuat token ketika login​⁡*//
// const authMiddleware = async (req, res, next) => {
//     try {
//          Ambil token dari header Authorization

//          const authHeader    = req.cookies.token;
//         const authHeader = req.header('Authorization');
//         console.log('authoriz', authHeader);
//         if (!authHeader) {
//             return res.status(401).json({ message: 'Access Denied/tidak ada token' });
//         }

//          Verifikasi token
//         const verify = jwt.verify(authHeader, process.env.JWT_SECRET);

//          Cari user berdasarkan ID yang ada di token
//         const user = await prisma.user.findUnique({
//             where: { id: verify.id }
//         });

//              Jika user tidak ditemukan (misalnya user sudah dihapus)
//         if (!user) {
//             return res.status(404).json({ message: 'User tidak ditemukan!' });
//         }

//             Simpan data user di req agar bisa digunakan di endpoint berikutnya
//         req.user = user;

//         next(); // Lanjutkan request ke handler berikutnya
//     } catch (error) {
//         return res.status(401).json({ message: 'Token invalid atau sudah kadaluarsa!' });
//     }
// };

//*​‌‍‌⁡⁣⁢⁣middleware mengambil data user yang sedang login ⁡⁣⁢⁣dengan autoriz​⁡⁡*//
// const authMiddleware = async (req, res, next) => {
// try {

//     console.log('Headers:', req.headers);

//     const authHeader = req.header('Authorization');

//     // console.log('Authorization Header:', authHeader);
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(401).json({ message: 'Access Denied / Tidak ada token' });
//     }

//     const token = authHeader.split(' ')[1]; 

//     const verify = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await prisma.user.findUnique({
//         where: { id: verify.id }
//     });

//     if (!user) {
//         return res.status(404).json({ message: 'User tidak ditemukan!' });
//     }

//     req.user = user; 
//     next(); 
// } catch (error) {
//     return res.status(401).json({ message: 'Token invalid atau sudah kadaluwarsa!' });
// }
// };

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
                media: '*Hanya file gambar (jpg, png, webp) atau video (mp4, mov) yang diperbolehkan'
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

    next(); // lanjut ke controller
};




module.exports = { authMiddleware, validateNewsMedia };
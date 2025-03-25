const prisma = require('../db');
const jwt = require('jsonwebtoken');

//middleware tanpa cookie
const authMiddleware = async (req, res, next) => {
    try {
        // Ambil token dari header Authorization

        // const authHeader    = req.cookies.token;
        const authHeader = req.header('Authorization');
        console.log('authoriz', authHeader);
        if (!authHeader) {
            return res.status(401).json({ message: 'Access Denied/tidak ada token' });
        }

        // Verifikasi token
        const verify = jwt.verify(authHeader, process.env.JWT_SECRET);

        // Cari user berdasarkan ID yang ada di token
        const user = await prisma.user.findUnique({
            where: { id: verify.id }
        });

        // Jika user tidak ditemukan (misalnya user sudah dihapus)
        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan!' });
        }

        // Simpan data user di req agar bisa digunakan di endpoint berikutnya
        req.user = user;

        next(); // Lanjutkan request ke handler berikutnya
    } catch (error) {
        return res.status(401).json({ message: 'Token invalid atau sudah kadaluarsa!' });
    }
};

module.exports = { authMiddleware };
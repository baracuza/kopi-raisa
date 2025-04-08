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
    console.log('Headers:', req.headers);
    try {
        const authHeader    = req.cookies.token ;

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

module.exports = { authMiddleware };
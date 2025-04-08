const express = require('express');
const prisma = require('../db');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const passport = require('passport');

const { createUser, loginUser, updateUser, sendResetPasswordEmail, resetPassword } = require('./user.service');
const { validateRegister, validateLogin } = require('../validation/user.validation');
const { authMiddleware } = require('../middleware/middleware');


const router = express.Router();


router.post('/daftar', validateRegister, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validasi gagal!',
                errors: errors.array().map(error => error.msg),
            });
        }

        const userData = req.body;

        userData.password = await bcrypt.hash(userData.password, 10);
        const newUser = await createUser(userData);

        res.status(201).json({
            message: 'User berhasil didaftarkan!',
            data: newUser,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal mendaftarkan user!',
            error: error.message,
        });
    }
});

router.post('/login', validateLogin, async (req, res) => {
    try {
        // Cek validasi input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validasi gagal!',
                errors: errors.array().map(error => error.msg),
            });
        }

        const userLogin = req.body;
        const user = await loginUser(userLogin);

        // Simpan token dalam cookie HTTP-Only
        res.cookie("token", user.token, {
            httpOnly: true,      
            secure: true,        
            sameSite: "strict",  
            maxAge: 1 * 24 * 60 * 60 * 1000 
        });

        return res.status(200).json({ message: 'Login berhasil!', data: user });
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal login!',
            error: error.message,
        });
    }
});

router.get('/User', authMiddleware, async (req, res) => {
    try {
        const user = req.user;

        return res.status(200).json({
            message: 'Data profil berhasil diambil!',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone_number: user.phone_number,
                image: user.image,
                admin: user.admin,
                verified: user.verified
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Gagal mengambil data profil!', error: error.message });
    }
});

router.put('/User', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Ambil ID user dari middleware
        const updatedData = req.body; 

        const updatedUser = await updateUser({updatedData, userId});

        return res.status(200).json({
            message: 'Profil berhasil diperbarui!',
            data: updatedUser,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Gagal memperbarui profil!', error: error.message });
    }
});

router.post('/reset-password-request', async (req, res) => {
    try{
        const { email } = req.body;
        await sendResetPasswordEmail(email);
        return res.status(200).json({ message: 'link reset password telah dikirim ke email Anda!' });
    }catch (error) {
        return res.status(500).json({ message: 'Gagal mengirim link reset password!', error: error.message });
    }
});

router.put('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    
    try {
        await resetPassword({ token, newPassword });
        return res.status(200).json({ message: 'Password berhasil direset!' });
    } catch (error) {
        return res.status(500).json({ message: 'Gagal mereset password!', error: error.message });
    }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

//* Callback URL yang akan dipanggil setelah pengguna memberikan izin tanpa lewat cookie(untuk develop)*/
// router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {

//     const token = jwt.sign({ id: req.user.id, admin: req.user.admin }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });
//     res.redirect(`http://localhost:2000?token=${token}`); // Redirect to your frontend with the token
// });

router.get('/google/callback', passport.authenticate('google', { session: false }),
    (req, res) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Autentikasi gagal!' });
        }

        // Simpan token dalam cookie HTTP-Only
        res.cookie("token", req.user.token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 1 * 24 * 60 * 60 * 1000 // 1 hari
        });

        res.redirect(`https://sekolahkopiraisa.vercel.app`); // Redirect to your frontend with the token
        // Kirim data user dan token ke client
        // res.status(200).json({ message: 'Login berhasil!', user: req.user.user, token: req.user.token });
    });


router.get('/logout', (req, res) => {
    // Hapus cookie token
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout berhasil!' });
});
module.exports = router;

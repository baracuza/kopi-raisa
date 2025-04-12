const express = require('express');
const prisma = require('../db');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const passport = require('passport');
const jwt = require('jsonwebtoken');


const { createUser, loginUser, updateUser, sendResetPasswordEmail, resetPassword } = require('./user.service');
const { validateRegister, validateLogin } = require('../validation/user.validation');
const { authMiddleware } = require('../middleware/middleware');


const router = express.Router();


router.post('/daftar', validateRegister, async (req, res) => {
    try {
        console.log('Content-Type:', req.headers['content-type']);
        console.log('Body:', req.body);


        const errors = validationResult(req);
        console.log('errors:', errors.array());
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validasi gagal!',
                errors: errors.array().reduce((acc, curr) => {
                    if (!acc[curr.path]) {
                        acc[curr.path] = curr.msg;
                    }
                    return acc;
                }, {})

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
            message: error.message
        });
    }
});

router.post('/login', validateLogin, async (req, res) => {
    try {
        console.log("BODY DARI CLIENT:", req.body);
        // Cek validasi input
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validasi gagal!',
                errors: errors.array().reduce((acc, curr) => {
                    if (!acc[curr.path]) {
                        acc[curr.path] = curr.msg;
                    }
                    return acc;
                }, {})

            });
        }

        const userLogin = req.body;
        const user = await loginUser(userLogin);

        // Simpan token dalam cookie HTTP-Only
        res.cookie("token", user.token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 1 * 24 * 60 * 60 * 1000
        });

        // res.redirect(`https://sekolahkopiraisa.vercel.app`);
        console.log("HASIL VALIDASI:", errors.array());
        return res.status(200).json({ message: 'Login berhasil!', data: user });
    } catch (error) {
        return res.status(400).json({
            message: error.message

        });
    }
});

router.get('/user', authMiddleware, async (req, res) => {
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

router.put('/user', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const updatedData = req.body;

        const updatedUser = await updateUser({ updatedData, userId });

        return res.status(200).json({
            message: 'Profil berhasil diperbarui!',
            data: updatedUser,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Gagal memperbarui profil!', error: error.message });
    }
});

router.post('/reset-password-request', async (req, res) => {
    try {
        const { email } = req.body;
        await sendResetPasswordEmail(email);
        return res.status(200).json({ message: 'link reset password telah dikirim ke email Anda!' });
    } catch (error) {
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


router.get('/google', (req, res, next) => {
    const redirectTo = req.query.redirect || '/login'; // default ke login
    const state = Buffer.from(JSON.stringify({ redirectTo })).toString('base64'); // encode ke base64
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state
    })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        const state = req.query.state;
        let redirectTo = '/login'; // fallback default

        // Decode state (jika ada)
        if (state) {
            try {
                const parsed = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
                if (parsed.redirectTo) {
                    redirectTo = parsed.redirectTo;
                }
            } catch (e) {
                console.error('Failed to parse redirect state:', e);
            }
        }

        // Jika gagal login atau user tekan "Cancel"
        if (err || !user) {
            return res.redirect(`https://sekolahkopiraisa.vercel.app${redirectTo}`);
        }

        // Sukses login
        return res.redirect(`https://sekolahkopiraisa.vercel.app/oauth-success?token=${user.token}`);
    })(req, res, next);
});

router.post('/save-token', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(400).json({ message: 'Token tidak ditemukan!' });
    }

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "None",
        maxAge: 1 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({ message: 'Token berhasil disimpan di cookie!' });
});


// 1.b Facebook Login
router.post('/facebook/link',
    authMiddleware,
    passport.authenticate('facebook-token', { session: false }),
    async (req, res) => {
        try {
            const facebookProfile = req.user; // dari FacebookTokenStrategy
            const currentUserToken = req.cookies.token || req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(currentUserToken, process.env.JWT_SECRET);

            const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });

            if (!currentUser) {
                return res.status(401).json({ message: "User tidak ditemukan" });
            }

            const upserted = await prisma.facebookAccount.upsert({
                where: { userId: currentUser.id },
                update: {
                    facebook_id: facebookProfile.id,
                    name: facebookProfile.displayName,
                    email: facebookProfile.emails?.[0]?.value || `${facebookProfile.id}@facebook.com`,
                    image: facebookProfile.photos?.[0]?.value || null,

                    access_token: facebookProfile.accessToken,
                    token_expires: new Date(Date.now() + 60 * 60 * 24 * 60 * 1000), // perkiraan 60 hari
                    page_id: '',  // default kosong
                    page_name: '' // default kosong
                },
                create: {
                    facebook_id: facebookProfile.id,
                    name: facebookProfile.displayName,
                    email: facebookProfile.emails?.[0]?.value || `${facebookProfile.id}@facebook.com`,
                    image: facebookProfile.photos?.[0]?.value || null,
                    access_token: facebookProfile.accessToken,
                    token_expires: new Date(Date.now() + 60 * 60 * 24 * 60 * 1000),
                    page_id: '',
                    page_name: '',
                    user: { connect: { id: currentUser.id } }
                }
            });

            return res.json({ message: 'Akun Facebook berhasil ditautkan', data: upserted });
        } catch (error) {
            console.error("❌ Gagal menautkan akun Facebook:", error);
            return res.status(500).json({ message: 'Terjadi kesalahan internal.' });
        }
    }
);



// Callback setelah taut akun
router.get('/facebook/link/callback',
    authMiddleware,
    passport.authenticate('facebook-link', { session: false }),
    async (req, res) => {
        try {
            const facebookProfile = req.user;
            const currentUserToken = req.cookies.token || req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(currentUserToken, process.env.JWT_SECRET);
            const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });

            if (!currentUser) {
                return res.status(401).json({ message: "User tidak ditemukan" });
            }

            const email = facebookProfile.emails?.[0]?.value || `${facebookProfile.id}@facebook.com`;

            const upserted = await prisma.facebookAccount.upsert({
                where: { userId: currentUser.id },
                update: {
                    facebook_id: facebookProfile.id,
                    name: facebookProfile.displayName,
                    email,
                    image: facebookProfile.photos?.[0]?.value || null,
                    access_token: facebookProfile.accessToken,
                    token_expires: new Date(Date.now() + 60 * 60 * 1000), // 1 jam default
                },
                create: {
                    facebook_id: facebookProfile.id,
                    name: facebookProfile.displayName,
                    email,
                    image: facebookProfile.photos?.[0]?.value || null,
                    access_token: facebookProfile.accessToken,
                    token_expires: new Date(Date.now() + 60 * 60 * 1000),
                    user: { connect: { id: currentUser.id } }
                }
            });

            res.json({ message: '✅ Akun Facebook berhasil ditautkan ke user.' });

        } catch (error) {
            console.error('❌ Error linking Facebook account:', error);
            res.status(500).json({ message: '❌ Terjadi kesalahan saat menautkan akun Facebook.' });
        }
    }
);


// 3. Endpoint untuk mengambil daftar Page yang dimiliki user
router.get('/facebook/pages', async (req, res) => {
    const accessToken = req.query.accessToken;

    if (!accessToken) {
        return res.status(400).json({ message: 'Access token Facebook dibutuhkan!' });
    }

    try {
        const response = await axios.get(`https://graph.facebook.com/v12.0/me/accounts?access_token=${accessToken}`);

        return res.status(200).json({
            message: 'Berhasil mengambil halaman!',
            data: response.data.data // berisi daftar halaman user
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal mengambil halaman!',
            error: error.response?.data || error.message,
        });
    }
});

router.post('/logout', (req, res) => {

    res.clearCookie('token');
    res.status(200).json({ message: 'Logout berhasil!' });
});
module.exports = router;

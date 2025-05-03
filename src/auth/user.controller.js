const express = require('express');
const axios = require('axios');
const prisma = require('../db');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/multer');


const { createUser, loginUser, updateUser, sendResetPasswordEmail, resetPassword } = require('./user.service');
const { validateRegister, validateLogin, validateUpdateProfile } = require('../validation/validation');
const { authMiddleware, multerErrorHandler, validateProfilMedia } = require('../middleware/middleware');
const ApiError = require('../utils/apiError');


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
            // secure: false,
            sameSite: "None",
            // sameSite: "lax",
            maxAge: 1 * 24 * 60 * 60 * 1000
        });

        // res.redirect(`https://sekolahkopiraisa.vercel.app`);
        console.log("HASIL VALIDASI:", errors.array());
        return res.status(200).json({ message: 'Login berhasil!', data: user });
    } catch (error) {
        return res.status(400).json({
            message: error.message,
            // errors: error.message,
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

router.put('/user', authMiddleware, upload.single('media'), multerErrorHandler, validateUpdateProfile, validateProfilMedia, async (req, res) => {
    try {
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

        const userId = req.user.id;
        const updateData = {
            name: req.body.name,
            phone_number: req.body.phone_number,
            file: req.file,
        }
        const updatedUser = await updateUser({ userId, updateData });
        console.log("Update user:", updatedUser);

        return res.status(200).json({
            message: 'Profil berhasil diperbarui!',
            data: updatedUser,
        });
    } catch (error) {
        console.error("Gagal memperbarui profil:", error);

        const statusCode = error instanceof ApiError ? error.statusCode : 500;
        return res.status(statusCode).json({ message: error.message });
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

// 1. Endpoint untuk menautkan akun Facebook
router.post('/facebook/link',
    authMiddleware,
    async (req, res, next) => {
        try {
            const { accessToken } = req.body;

            if (!accessToken) {
                return res.status(400).json({ message: 'Access token diperlukan.' });
            }
            // Tambahkan ini agar passport-facebook-token bisa membaca token
            req.query.access_token = accessToken;

            // Autentikasi via passport-facebook-token
            passport.authenticate('facebook-token', { session: false }, async (err, profile, info) => {
                if (err) return next(err);
                if (!profile) {
                    return res.status(401).json({ message: 'Gagal autentikasi Facebook.', detail: info || null  });
                }

                const currentUserToken = req.cookies.token || req.headers.authorization?.split(' ')[1];
                const decoded = jwt.verify(currentUserToken, process.env.JWT_SECRET);
                const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });

                if (!currentUser) {
                    return res.status(401).json({ message: "User tidak ditemukan" });
                }

                const facebookProfile = profile;
                facebookProfile.accessToken = accessToken;

                // Ambil Facebook Page pakai axios
                let selectedPage = null;
                try {
                    const { data: pageData } = await axios.get(`https://graph.facebook.com/v19.0/me/accounts`, {
                        params: {
                            access_token: facebookProfile.accessToken,
                        }
                    });

                    if (pageData.data && pageData.data.length > 0) {
                        selectedPage = pageData.data[0]; // Ambil page pertama
                    } else {
                        return res.status(400).json({ message: 'Tidak ada Facebook Page yang ditemukan.' });
                    }
                } catch (pageError) {
                    console.error('Gagal mengambil page:', pageError?.response?.data || pageError.message);
                    return res.status(500).json({ message: 'Gagal mengambil Facebook Page.' });
                }

                // Ambil akun Instagram yang terhubung ke Page
                let instagramData = {};
                try {
                    const { data: igData } = await axios.get(
                        `https://graph.facebook.com/v19.0/${selectedPage.id}`,
                        {
                            params: {
                                fields: 'instagram_business_account{name,username,id}',
                                access_token: selectedPage.access_token,
                            },
                        }
                    );
                    console.log('Instagram Data:', igData);

                    if (igData.instagram_business_account) {
                        instagramData = {
                            ig_user_id: igData.instagram_business_account.id,
                            instagram_username: igData.instagram_business_account.username,
                            instagramAccount_id: igData.instagram_business_account.id, // Bisa sama dengan ig_user_id
                        };
                    }
                } catch (igErr) {
                    console.error('⚠️ Gagal mengambil data akun Instagram:', igErr.response?.data || igErr.message);
                    return res.status(500).json({ message: 'Gagal mengambil data akun Instagram.' });
                }



                // Simpan ke DB
                const upserted = await prisma.facebookAccount.upsert({
                    where: { facebook_id: facebookProfile.id },
                    update: {
                        name: facebookProfile.displayName,
                        email: facebookProfile.emails?.[0]?.value || `${facebookProfile.id}@facebook.com`,
                        image: facebookProfile.photos?.[0]?.value || null,
                        access_token: accessToken,
                        token_expires: new Date(Date.now() + 60 * 60 * 24 * 60 * 1000),
                        page_id: selectedPage.id,
                        page_name: selectedPage.name,
                        page_access_token: selectedPage.access_token,
                        ig_user_id: instagramData.ig_user_id || null,
                        instagram_username: instagramData.instagram_username || null,
                        instagramAccount_id: instagramData.instagramAccount_id || null,
                    },
                    create: {
                        facebook_id: facebookProfile.id,
                        name: facebookProfile.displayName,
                        email: facebookProfile.emails?.[0]?.value || `${facebookProfile.id}@facebook.com`,
                        image: facebookProfile.photos?.[0]?.value || null,
                        access_token: accessToken,
                        token_expires: new Date(Date.now() + 60 * 60 * 24 * 60 * 1000),
                        page_id: selectedPage.id,
                        page_name: selectedPage.name,
                        page_access_token: selectedPage.access_token,
                        ig_user_id: instagramData.ig_user_id || null,
                        instagram_username: instagramData.instagram_username || null,
                        instagramAccount_id: instagramData.instagramAccount_id || null,
                        // Hubungkan dengan user yang sedang login
                        user: { connect: { id: currentUser.id } },
                    }
                });

                return res.json({ message: 'Akun Facebook & Page berhasil ditautkan.', data: { ...upserted, instagram: instagramData, } });
            })(req, res, next);

        } catch (error) {
            console.error("❌ Gagal menautkan akun Facebook:", error);
            return res.status(500).json({ message: 'Terjadi kesalahan internal.', error: error.response?.data || error.message, });
        }
    }
);

// 3. Endpoint untuk mengambil daftar Page yang dimiliki user
router.get('/facebook/pages', authMiddleware, async (req, res) => {
    const accessToken = req.query.accessToken;

    if (!accessToken) {
        return res.status(400).json({ message: 'Access token Facebook dibutuhkan!' });
    }

    try {
        // Ambil halaman milik user
        const { data } = await axios.get('https://graph.facebook.com/v19.0/me/accounts', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const pages = data.data;
        if (!pages || pages.length === 0) {
            return res.status(404).json({ message: 'Tidak ada halaman Facebook yang ditemukan.' });
        }

        const page = pages[0]; // Ambil satu page (atau bisa frontend pilih)

        // Dapatkan user yang sedang login
        const userId = req.user.id;

        // Update akun Facebook yang sudah tertaut
        const updated = await prisma.facebookAccount.update({
            where: { userId },
            data: {
                page_id: page.id,
                page_name: page.name,
                access_token: page.access_token,
                token_expires: new Date(Date.now() + 60 * 60 * 24 * 60 * 1000), // anggap token page valid 60 hari
            }
        });

        return res.json({
            message: '✅ Halaman Facebook berhasil disimpan.',
            data: updated,
        });

    } catch (error) {
        console.error('❌ Gagal ambil/simpan halaman FB:', error.response?.data || error.message);
        return res.status(500).json({
            message: '❌ Terjadi kesalahan saat menyimpan halaman Facebook.',
            error: error.response?.data || error.message,
        });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: '/'
    });
    res.status(200).json({ message: 'Logout berhasil!' });
});
module.exports = router;

const express = require('express');
const prisma = require('../db');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const { createUser, loginUser } = require('./user.service');
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

        // const { email, password } = req.body;
        const userLogin = req.body;
        const user = await loginUser(userLogin);


        // Simpan token dalam cookie HTTP-Only
        // res.cookie("token", user.token, {
        //     httpOnly: true,      
        //     secure: true,        
        //     sameSite: "strict",  
        //     maxAge: 1 * 24 * 60 * 60 * 1000 
        // });

        return res.status(200).json({ message: 'Login berhasil!', data: user});
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal login!',
            error: error.message,
        });
    }
});


router.get('/getUserProfile', authMiddleware, async (req, res) => {
    try {
        const user = req.user; // Data user yang sudah diambil dari middleware

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



module.exports = router;

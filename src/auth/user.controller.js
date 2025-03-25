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


router.get('/profile', authMiddleware, async (req, res) => {
    return res.status(200).json({
        message: "Data profil berhasil diambil!",
        user: req.user
    });
});


module.exports = router;

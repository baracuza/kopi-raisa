const prisma = require('../db');
const { insertUser, isEmailTaken, isPhoneNumberTaken, findUserByIdentifier, updateByID, findUserByEmail, updatePasswordByID, findUserByID } = require('./user.repository');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');


dotenv.config();
const JWT_EXPIRES = process.env.JWT_EXPIRES;

const createUser = async (newUserData) => {

    const existingUser = await findUserByIdentifier(newUserData.email) || (newUserData.phone_number && await findUserByIdentifier(newUserData.phone_number));

    if (existingUser) {
        throw new Error('Email atau nomor HP sudah terdaftar');
    }
    const userData = await insertUser(newUserData);
    return userData;
};


// const loginUser = async ({ emailOrPhone, password }) => {
//     const user = await findUserByIdentifier(emailOrPhone);

//     if (!user) {
//         throw new Error('User tidak ditemukan!');
//     }

//     //cek password
//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) {
//         throw new Error('Password salah!');
//     }

//     //buat token
//     const token = await jsonwebtoken.sign({ id: user.id, admin: user.admin }, process.env.JWT_SECRET,
//         { expiresIn: JWT_EXPIRES }
//     );

//     return {
//         message: 'Login berhasil!', user: {
//             id: user.id,
//             name: user.name,
//             email: user.email,
//             phone_number: user.phone_number,
//             image: user.image,
//             admin: user.admin,
//             verified: user.verified
//         }, token
//     };


// };

const loginUser = async ({ emailOrPhone, password }) => {
    console.log("Mencari user:", emailOrPhone);

    const user = await findUserByIdentifier(emailOrPhone);
    console.log("Hasil pencarian user:", user);

    if (!user) {
        console.log("❌ User tidak ditemukan");
        throw new Error('Email/Password salah!');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    console.log("Password valid:", validPassword);

    if (!validPassword) {
        console.log("❌ Password salah");
        throw new Error('Email/Password salah!');
    }

    if (!process.env.JWT_SECRET) {
        console.error("❌ JWT_SECRET belum diset di environment!");
        throw new Error('Server error: JWT secret tidak ditemukan!');
    }

    const token = await jsonwebtoken.sign(
        { id: user.id, admin: user.admin },
        process.env.JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );
    console.log("✅ Token berhasil dibuat:", token);

    return {
        message: 'Login berhasil!',
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone_number: user.phone_number,
            image: user.image,
            admin: user.admin,
            verified: user.verified
        },
        token
    };
};


const updateUser = async ({ updatedData, userId }) => {
    const update = await updateByID({ updatedData, userId });

    return update;
}

const sendResetPasswordEmail = async (email) => {
    const user = await findUserByEmail(email);

    console.log('user', user);

    if (!user) {
        throw new Error('User tidak ditemukan!');
    }

    if (user.verified) {
        throw new Error('Akun ini menggunakan Google OAuth. Silakan login menggunakan Google.');
    }

    const resetToken = await jsonwebtoken.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '5m' });
    // console.log('resetToken', resetToken);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const mailOptions = {
        from: `"Kopi Raisa"<${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset Password',
        html: `Klik link ini untuk mereset password Anda:</p><a href="${resetLink}">${resetLink}</a><br><br><small>Link berlaku 5 menit.</small>`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email reset password terkirim ke:', email);

};

const resetPassword = async ({ token, newPassword }) => {
    const decoded = await jsonwebtoken.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
        throw new Error('Token tidak valid!');
    }

    const currentUser = await findUserByID(decoded.id);
    if (!currentUser) {
        throw new Error('Pengguna tidak ditemukan.');
    }
    console.log('newPassword:', typeof newPassword, newPassword);
    console.log('currentUser.password:', typeof currentUser.password, currentUser.password);

    if (!currentUser.password) {
        throw new Error('Akun ini didaftarkan melalui Google dan tidak memiliki password. Silakan login menggunakan Google.');
    }


    const isSamePassword = await bcrypt.compare(newPassword, currentUser.password);
    if (isSamePassword) {
        throw new Error('Password baru tidak boleh sama dengan yang lama.');
    }


    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await updatePasswordByID({ password: hashedPassword, userId: decoded.id });

    return updatedUser;
}



module.exports = { createUser, loginUser, updateUser, sendResetPasswordEmail, resetPassword };
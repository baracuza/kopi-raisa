const prisma = require('../db');
const { insertUser, isEmailTaken, isPhoneNumberTaken, findUserByIdentifier, updateByID, findUserByEmail, updatePasswordByID, findUserByID, upsertFacebookAccount } = require('./user.repository');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

const { deleteFromCloudinaryByUrl } = require('../utils/cloudinary');
const { uploadToCloudinary } = require('../services/cloudinaryUpload.service');


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

const loginUser = async ({ emailOrPhone, password }) => {
    console.log("Mencari user:", emailOrPhone);

    const user = await findUserByIdentifier(emailOrPhone);
    console.log("Hasil pencarian user:", user);

    if (!user) {
        console.log("❌ User tidak ditemukan");
        throw new Error('Email/Password salah!');
    }

    if (user.verified === true) {
        console.log("❌ Akun telah terdaftar dengan metode lain. Silahkan coba dengan metode yang anda gunakan sebelumnya!");
        throw new Error(`Akun telah terdaftar dengan metode lain. Silahkan coba dengan metode yang anda gunakan sebelumnya!`);
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

const updateUser = async ({ updateData, userId }) => {
    const existingUser = await findUserByID(userId);
    if (!existingUser) {
        throw new Error('User tidak ditemukan!');
    }
    const { name, phone_number, file } = updateData;
    const updatePayload = { name, phone_number };


    if (file) {
        if (existingUser.image) {
            await deleteFromCloudinaryByUrl(existingUser.image);
        }
        const imageUrl = await uploadToCloudinary(file.buffer, file.originalname);
        updatePayload.image = imageUrl;
    }
    const update = await updateByID({ userId, updateData: updatePayload });
    console.log("Update user:", update);

    return update;
}

const sendResetPasswordEmail = async (email) => {
    const user = await findUserByEmail(email);

    console.log('user', user);

    if (!user) {
        throw new Error('User tidak ditemukan!');
    }

    if (user.verified) {
        throw new Error(`Gagal mengirim Email reset password. Akun ${user.email} telah terdaftar dengan metode lain. Silahkan coba dengan metode yang anda gunakan sebelumnya!`);
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
        throw new Error('Akun ini didaftarkan melalui metode lain. Silahkan coba dengan metode yang anda gunakan sebelumnya!');
    }


    const isSamePassword = await bcrypt.compare(newPassword, currentUser.password);
    if (isSamePassword) {
        throw new Error('Password baru tidak boleh sama dengan yang lama.');
    }


    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await updatePasswordByID({ password: hashedPassword, userId: decoded.id });

    return updatedUser;
}

const getFacebookLoginUrl = () => {
    const redirectUri = `${process.env.BACKEND_URL}/auth/facebook/callback`;
    const scope = [
        'email', 'public_profile', 'user_photos', 'user_posts',
        'pages_show_list', 'pages_read_engagement', 'pages_manage_posts',
        'pages_read_user_content', 'pages_manage_metadata',
        'pages_manage_engagement', 'instagram_basic',
        'instagram_content_publish', 'instagram_manage_insights',
        'instagram_graph_user_media', 'instagram_graph_user_profile'
    ].join(',');

    return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}`;
};

const fetchFacebookAccountData = async (accessToken) => {
    try {
        const meRes = await axios.get('https://graph.facebook.com/v18.0/me', {
            params: {
                access_token: accessToken,
                fields: 'id,name,email,picture'
            }
        });

        const userInfo = meRes.data;

        const pagesRes = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
            params: { access_token: accessToken }
        });

        const page = pagesRes.data.data?.[0];
        if (!page) return null;

        const igRes = await axios.get(`https://graph.facebook.com/v18.0/${page.id}`, {
            params: {
                access_token: page.access_token,
                fields: 'instagram_business_account'
            }
        });

        const igId = igRes.data.instagram_business_account?.id;

        let igUsername = null;
        if (igId) {
            const igUser = await axios.get(`https://graph.facebook.com/v18.0/${igId}`, {
                params: {
                    access_token: page.access_token,
                    fields: 'username'
                }
            });
            igUsername = igUser.data.username;
        }

        return {
            facebook_id: userInfo.id,
            name: userInfo.name,
            image: userInfo.picture?.data?.url || null,
            access_token: accessToken,
            page_id: page.id,
            page_name: page.name,
            page_access_token: page.access_token,
            instagramAccount_id: igId || null,
            instagram_username: igUsername || null,
            ig_user_id: igId || null,
            email: userInfo.email || 'no-email@facebook.com',
            token_expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // token 60 hari
        };
    } catch (err) {
        console.error('[Facebook API Error]', err.message);
        return null;
    }
};


const upsertFacebook = async (userId, fbData) => {
    return await upsertFacebookAccount(userId, fbData);
};

module.exports = { createUser, loginUser, updateUser, sendResetPasswordEmail, resetPassword, getFacebookLoginUrl, upsertFacebook, fetchFacebookAccountData };
const prisma = require('../db');
const { get } = require('./user.controller');
const { insertUser, findUserByIdentifier } = require('./user.repository');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const dotenv = require('dotenv');


dotenv.config();
const JWT_EXPIRES = process.env.JWT_EXPIRES;

const createUser = async (newUserData) => {
    const userData = await insertUser(newUserData);

    return userData;
};


const loginUser = async ({ identifier, password }) => {
    const user = await findUserByIdentifier(identifier);

    if (!user) {
        throw new Error('User tidak ditemukan!');
    }

    //cek password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        throw new Error('Password salah!');
    }

    //buat token
    const token = await jsonwebtoken.sign({ id: user.id, admin: user.admin }, process.env.JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );

    return {
        message: 'Login berhasil!', user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone_number: user.phone_number,
            image: user.image,
            admin: user.admin,
            verified: user.verified
        }, token
    };


};





module.exports = { createUser, loginUser };
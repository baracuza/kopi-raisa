const prisma = require('../db');

const insertUser = async (newUserData) => {
    const userData = await prisma.User.create({
        data: {
            name: newUserData.name,
            email: newUserData.email,
            password: newUserData.password,
            image: newUserData.image || null,
            phone_number: newUserData.phone_number,
            admin: newUserData.admin || false,
            verified: newUserData.verified || false
        }
    });

    return userData;
};

const findUserByIdentifier = async (identifier) => {
    const user = await prisma.User.findFirst({
        where: {
            OR: [
                {
                    email: identifier,
                },
                {
                    phone_number: identifier,
                }
            ]
        }
    });

    return user;
};

const updateByID = async ({ updatedData, userId }) => {
    const user = await prisma.User.update({
        where: { id: userId },
        data: updatedData,
    });

    return user;
};

const findUserByEmail = async (email) => {
    const user = await prisma.User.findUnique({
        where: { email },
    });

    return user;
};

const findUserByID = async (userId) => {
    const user = await prisma.User.findUnique({
        where: { id: userId },
    });

    return user;
};

const updatePasswordByID = async ({ password, userId }) => {
    const user = await prisma.User.update({
        where: { id: userId },
        data: { password },
    });

    return user;
};



module.exports = {insertUser, findUserByIdentifier, updateByID, findUserByEmail, updatePasswordByID, findUserByID};
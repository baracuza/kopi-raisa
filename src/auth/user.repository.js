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

module.exports = {insertUser, findUserByIdentifier};
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

const isEmailTaken = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });
    return !!user;
};

const isPhoneNumberTaken = async (phone_number) => {
    if (!phone_number) return false;
    const user = await prisma.user.findUnique({
        where: { phone_number },
    });
    return !!user;
};


const findUserByIdentifier = async (emailOrPhone) => {
    const user = await prisma.User.findFirst({
        where: {
            OR: [
                {
                    email: emailOrPhone,
                },
                {
                    phone_number: emailOrPhone,
                }
            ]
        }
    });

    return user;
};

const updateByID = async ({ updateData, userId }) => {
    const user = await prisma.User.update({
        where: { id: userId },
        data: updateData,
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

const findUserNumber = async (phoneNumber,userIdToExclude) => { 
    const user = await prisma.User.findFirst({
        where: {
            phone_number: phoneNumber,
            NOT: {
                id: userIdToExclude
            }
        }
    });

    return user;
}


const updatePasswordByID = async ({ password, userId }) => {
    const user = await prisma.User.update({
        where: { id: userId },
        data: { password },
    });

    return user;
};



module.exports = { insertUser, isPhoneNumberTaken, isEmailTaken, findUserByIdentifier, updateByID, findUserByEmail, updatePasswordByID, findUserByID, findUserNumber };
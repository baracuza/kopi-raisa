const prisma = require('../db');

const findPartner = async () => {
    const partners = await prisma.Partner.findMany({
        include: {
            user: {
                select: { id: true, name: true, email: true }
            }
        }
    });

    return partners;
};

const findPartnerById = async (partnerId) => {
    const partner = await prisma.Partner.findUnique({
        where: {
            id: parseInt(partnerId)
        },
        include: {
            user: {
                select: { id: true, name: true, email: true }
            }
        }
    });

    return partner;
};

const insertPartner = async (newPartnerData, user_id) => {
    const partner = await prisma.Partner.create({
        data: {
            name: newPartnerData.name,
            owner_name: newPartnerData.owner_name,
            phone_number: newPartnerData.phone_number,
            address: newPartnerData.address || null,

        },
    });

    return partner;
};

const editPartner = async (id, editedPartnerData) => {
    const partner = await prisma.Partner.update({
        where: {
            id: parseInt(id),
        },
        data: {
            name: editedPartnerData.name,
            description: editedPartnerData.description,
            image_url: editedPartnerData.image_url || null,
        },
    });

    return partner;
};

const deletePartner = async (id) => {
    const partner = await prisma.Partner.delete({
        where: {
            id: id,
        },
    });

    return partner;
};

module.exports = {
    findPartner,
    findPartnerById,
    insertPartner,
    deletePartner,
    editPartner,
};
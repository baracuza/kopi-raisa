const prisma = require('../db');

const {
    findPartner,
    findPartnerById,
    insertPartner,
    deletePartner,
    editPartner
} = require("./partner.repository");

const getPartner = async () => {
    const partners = await findPartner();

    return partners;
};

const getPartnerById = async (partnerId) => {
    const partner = await findPartnerById(partnerId);
    if (!partner) {
        throw new Error("Partner tidak ditemukan!");
    }

    return partner;
};

const createPartner = async (newPartnerData, user_id) => {
    const partnerData = await insertPartner(newPartnerData, user_id);

    return partnerData;
};

const updatePartner = async (id, editedPartnerData) => {
    const existingPartner = await findPartnerById(id);
    if (!existingPartner) {
        throw new Error("Partner tidak ditemukan!");
    }

    const partnerData = await editPartner(id, editedPartnerData);

    return partnerData;
};

const removePartner = async (id) => {
    const existingPartner = await findPartnerById(id);
    
    if (!existingPartner) {
        throw new Error("Partner tidak ditemukan!");
    }
    const partnerData = await deletePartner(id);

    return partnerData;
};

module.exports = { getPartner, getPartnerById, createPartner, updatePartner, removePartner };
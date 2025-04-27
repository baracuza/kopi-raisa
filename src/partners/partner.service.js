const ApiError = require("../utils/apiError");

const {
    findPartner,
    findPartnerById,
    insertNewPartner,
    deletePartner,
    editPartner
} = require("./partner.repository");

const getAllPartners = async () => {
    const partners = await findPartner();
    if (!partners) {
        throw new ApiError('Gagal mendapatkan data partner!', 500);
    }
    return partners;
};

const getPartnerById = async (partnerId) => {
    const partner = await findPartnerById(partnerId);
    if (!partner) {
        throw new ApiError('Partner tidak ditemukan!', 404);
    }

    return partner;
};

const createPartner = async (newPartnerData) => {
    const partnerNewData = await insertNewPartner(newPartnerData);

    return partnerNewData;
};

const updatePartner = async (id, editedPartnerData) => {
    const existingPartner = await findPartnerById(id);
    if (!existingPartner) {
        throw new ApiError('Partner tidak ditemukan!', 404);
    }

    const partnerData = await editPartner(id, editedPartnerData);

    return partnerData;
};

const removePartner = async (id) => {
    const existingPartner = await findPartnerById(id);
    
    if (!existingPartner) {
        throw new ApiError('Partner tidak ditemukan!', 404);
    }
    const partnerData = await deletePartner(id);

    return partnerData;
};

module.exports = { getAllPartners, getPartnerById, createPartner, updatePartner, removePartner };
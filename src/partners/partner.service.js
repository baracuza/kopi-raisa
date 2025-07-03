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
        throw new ApiError(500,'Gagal mendapatkan data partner!');
    }
    return partners;
};

const getPartnerById = async (partnerId) => {
    const partner = await findPartnerById(partnerId);
    console.log('partner database:', partner);
    if (!partner) {
        throw new ApiError(404,'Partner tidak ditemukan!');
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
        throw new ApiError(404,'Partner tidak ditemukan!');
    }

    console.log('data update:', editedPartnerData);

    const partnerData = await editPartner(id, editedPartnerData);

    return partnerData;
};

const removePartner = async (id) => {
    const existingPartner = await findPartnerById(id);
    
    if (!existingPartner) {
        throw new ApiError(404,'Partner tidak ditemukan!');
    }
    const partnerData = await deletePartner(id);
    
    if (!partnerData) {
        throw new ApiError(500,'Gagal menghapus partner!');
    }
    return partnerData;
};

module.exports = { getAllPartners, getPartnerById, createPartner, updatePartner, removePartner };
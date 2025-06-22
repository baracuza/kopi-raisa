const prisma = require('../db');

const findPartner = async () => {
    const partners = await prisma.Partner.findMany({
        include: {
            products:{
                include:{
                    inventory:true,
                }
            },
        }
    });
    return partners;
};

const findPartnerById = async (partnerId) => {
    const partner = await prisma.partner.findUnique({
        where: {
            id: parseInt(partnerId)
        },
        include: {
            products: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                    description: true,
                    image: true,
                    inventory: {
                        select: {
                            stock: true,
                        }
                    },
                }
            }
        }
    });
    return partner;
};

const insertNewPartner = async (newPartnerData) => {
    const partner = await prisma.Partner.create({
        data: {
            name: newPartnerData.name,
            owner_name: newPartnerData.owner_name,
            phone_number: newPartnerData.phone_number,
            origin_id: newPartnerData.origin_id || null,
            origin_province: newPartnerData.origin_province || null,
            origin_city: newPartnerData.origin_city || null,
            origin_district: newPartnerData.origin_district || null,
            origin_subdistrict: newPartnerData.origin_subdistrict || null,
            origin_zip_code: newPartnerData.origin_zip_code || null,
        },
    });

    return partner;
};

const editPartner = async (id, editedPartnerData) => {
    const partner = await prisma.Partner.update({
        where: {
            id: parseInt(id),
        },
        data:editedPartnerData,
    });
    return partner;
};

const deletePartner = async (id) => {
    const partner = await prisma.partner.delete({
        where: {
            id: parseInt(id),
        },
    });
    return partner;
};

module.exports = {
    findPartner,
    findPartnerById,
    insertNewPartner,
    deletePartner,
    editPartner,
};
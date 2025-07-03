const express = require('express');
const prisma = require('../db');

const { getAllPartners, getPartnerById, createPartner, updatePartner, removePartner } = require('./partner.service');
const { authMiddleware } = require('../middleware/middleware');
const { partnerValidator } = require('../validation/validation');
const ApiError = require('../utils/apiError');
const { validationResult } = require('express-validator');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        if (!req.user.admin) {
            return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa mengakses.' });
        }
        const partners = await getAllPartners();

        const formatedPartner = partners.map(partner => ({
            idPartner: partner.id,
            namePartner: partner.name,
            ownerPartner: partner.owner_name,
            phoneNumberPartner: partner.phone_number,
            addressPartner: partner.address,
            products: partner.products.map(product => ({
                idProduct: product.id,
                nameProduct: product.name,
                priceProduct: product.price,
                descriptionProduct: product.description,
                stockProduct: product.inventory.stock,
                soldProduct: product.sold,
                imageProduct: product.image,
            }))
        }))

        console.log('data', partners);
        res.status(200).json({
            message: 'Data partner berhasil didapatkan!',
            // data: formatedPartner,
            data: partners,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            })
        }

        console.error('Error getting partners:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan di server!',
            error: error.message,
        });
    }
});

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const partner = await getPartnerById(id);

        const formatedPartnerId = {
            idPartner: partner.id,
            namePartner: partner.name,
            ownerPartner: partner.owner_name,
            phoneNumberPartner: partner.phone_number,
            addressPartner: partner.address,
            products: partner.products.map(product => ({
                idProduct: product.id,
                nameProduct: product.name,
                priceProduct: product.price,
                descriptionProduct: product.description,
                stockProduct: product.inventory.stock,
                soldProduct: product.sold,
                imageProduct: product.image,
            }))
        }

        console.log('data', partner);
        res.status(200).json({
            message: 'Data partner berhasil didapatkan!',
            data: formatedPartnerId,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error('Error getting partner:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan di server!',
            error: error.message,
        });
    }
});

router.post('/', authMiddleware, partnerValidator, async (req, res) => {
    try {
        console.log('BODY CLIENT:', req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorObject = errors.array().reduce((acc, curr) => {
                const key = curr.path && curr.path !== '' ? curr.path : 'global';
                if (!acc[key]) {
                    acc[key] = curr.msg;
                }
                return acc;
            }, {});

            return res.status(400).json({
                message: "Validasi gagal!",
                errors: errorObject
            });
        }

        if (!req.user.admin) {
            return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa mengakses.' });
        }
        const dataPartner = req.body;
        const newPartner = await createPartner(dataPartner);

        console.log('data', newPartner);
        res.status(201).json({
            message: 'Partner berhasil ditambahkan!',
            data: newPartner,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            })
        }

        console.error('Error adding partner:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan di server!',
            error: error.message,
        });
    }
});

router.put('/:id', authMiddleware, partnerValidator, async (req, res) => {
    try {
        console.log('BODY CLIENT:', req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorObject = errors.array().reduce((acc, curr) => {
                const key = curr.path && curr.path !== '' ? curr.path : 'global';
                if (!acc[key]) {
                    acc[key] = curr.msg;
                }
                return acc;
            }, {});

            return res.status(400).json({
                message: "Validasi gagal!",
                errors: errorObject
            });
        }
        const { id } = req.params;
        const {name,owner_name,phone_number} = req.body;


        if (!req.user.admin) {
            return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa mengakses.' });
        }

        const updatedPartner = await updatePartner(id, {
            name,
            owner_name,
            phone_number,
        });

        console.log('data', updatedPartner);
        res.status(200).json({
            message: 'Partner berhasil diperbarui!',
            data: updatedPartner,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            })
        }

        console.error('Error updating partner:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan di server!',
            error: error.message,
        });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.user.admin) {
            return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa mengakses.' });
        }

        const deletePartner = await removePartner(id);

        console.log('data', deletePartner);
        res.status(200).json({
            message: 'Partner berhasil dihapus!',
            data: deletePartner,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            })
        }

        console.error('Error deleting partner:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan di server!',
            error: error.message,
        });
    }
});


module.exports = router;
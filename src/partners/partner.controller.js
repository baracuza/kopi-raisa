const express = require('express');
const prisma = require('../db');

const { getPartner, getPartnerById, createPartner, updatePartner, removePartner } = require('./partner.service');
const { authMiddleware } = require('../middleware/middleware');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const partners = await getPartner();

        res.status(200).json({
            message: 'Data partner berhasil didapatkan!',
            data: partners,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal mendapatkan data partner!',
            error: error.message,
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const partner = await getPartnerById(id);

        if (!partner) {
            return res.status(404).json({
                message: 'Data partner tidak ditemukan!',
            });
        }

        res.status(200).json({
            message: 'Data partner berhasil didapatkan!',
            data: partner,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal mendapatkan data partner!',
            error: error.message,
        });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        if (!req.user.admin) {
            return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa menambahkan partner.' });
        }
        const partnerData = req.body;
        const user_id = req.user.id;
        const newPartner = await createPartner(partnerData, user_id);

        res.status(201).json({
            message: 'Partner berhasil ditambahkan!',
            data: newPartner,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal menambahkan partner!',
            error: error.message,
        });
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const editedPartnerData = req.body;

        if (!req.user.admin) {
            return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa memperbarui partner.' });
        }

        const updatedPartner = await updatePartner(id, editedPartnerData);

        res.status(200).json({
            message: 'Partner berhasil diperbarui!',
            data: updatedPartner,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal memperbarui partner!',
            error: error.message,
        });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.user.admin) {
            return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa menghapus partner.' });
        }

        const deletePartner = await removePartner(id);

        res.status(200).json({
            message: 'Partner berhasil dihapus!',
            data: deletePartner,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal menghapus partner!',
            error: error.message,
        });
    }
});


module.exports = router;
const express = require('express');
const prisma = require('../db');

const { getPartner, getPartnerById, createPartner, updatePartner, removePartner } = require('./partner.service');
const { authMiddleware } = require('../middleware/middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Partner
 *   description: API untuk mengelola data partner
 */

/**
 * @swagger
 * /api/v1/partners:
 *   get:
 *     summary: Mendapatkan seluruh data partner
 *     tags: [Partner]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan data partner
 *       500:
 *         description: Gagal mendapatkan data partner
 */

/**
 * @swagger
 * /api/v1/partners/{id}:
 *   get:
 *     summary: Mendapatkan partner berdasarkan ID
 *     tags: [Partner]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID partner
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan data partner
 *       404:
 *         description: Partner tidak ditemukan
 *       500:
 *         description: Gagal mendapatkan data partner
 */

/**
 * @swagger
 * /api/v1/partners:
 *   post:
 *     summary: Menambahkan partner baru (admin only)
 *     tags: [Partner]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               logo:
 *                 type: string
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Partner berhasil ditambahkan
 *       403:
 *         description: Akses ditolak (bukan admin)
 *       500:
 *         description: Gagal menambahkan partner
 */

/**
 * @swagger
 * /api/v1/partners/{id}:
 *   put:
 *     summary: Memperbarui partner berdasarkan ID (admin only)
 *     tags: [Partner]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID partner
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               logo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Partner berhasil diperbarui
 *       403:
 *         description: Akses ditolak (bukan admin)
 *       500:
 *         description: Gagal memperbarui partner
 */

/**
 * @swagger
 * /api/v1/partners/{id}:
 *   delete:
 *     summary: Menghapus partner berdasarkan ID (admin only)
 *     tags: [Partner]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID partner
 *     responses:
 *       200:
 *         description: Partner berhasil dihapus
 *       403:
 *         description: Akses ditolak (bukan admin)
 *       500:
 *         description: Gagal menghapus partner
 */


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

router.get('/:id', authMiddleware, async (req, res) => {
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
        const dataPartner = req.body;
        const user_id = req.user.id;
        const newPartner = await createPartner(dataPartner, user_id);

        console.log(newPartner);
        res.status(201).json({
            message: 'Partner berhasil ditambahkan!',
            data: newPartner,
        });
    } catch (error) {
        console.error('Error adding partner:', error);
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
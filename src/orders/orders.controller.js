const express = require('express');
const prisma = require('../db');

const { getAllOrders, getOrdersById, createOrders, updateOrders, removeOrders, getOrdersByPartnerId, getOrdersByUserId, getOrdersByStatus } = require('./orders.service');
const { authMiddleware } = require('../middleware/middleware');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const orders = await getAllOrders();
        res.status(200).json({
            message: 'Data order berhasil didapatkan!',
            data: orders,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Terjadi kesalahan di server!',
            error: error.message,
        });
    }
});

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const order = await getOrdersById(id);
        res.status(200).json({
            message: 'Data order berhasil didapatkan!',
            data: order,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error('Error getting order:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan di server!',
            error: error.message,
        });
    }
});

router.get('/partner/:partnerId', authMiddleware, async (req, res) => {
    try {
        const { partnerId } = req.params;
        const orders = await getOrdersByPartnerId(partnerId);
        res.status(200).json({
            message: 'Data order berhasil didapatkan!',
            data: orders,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error('Error getting order:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan di server!',
            error: error.message,
        });
    }
});

router.get('/user/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await getOrdersByUserId(userId);
        res.status(200).json({
            message: 'Data order berhasil didapatkan!',
            data: orders,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error('Error getting order:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan di server!',
            error: error.message,
        });
    }
});

router.get('/status/:status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.params;
        const orders = await getOrdersByStatus(status);
        res.status(200).json({
            message: 'Data order berhasil didapatkan!',
            data: orders,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error('Error getting order:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan di server!',
            error: error.message,
        });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const newOrders = req.body;
        const user_id = req.user.id;

        const order = await createOrders(newOrders, user_id);

        res.status(201).json({
            message: 'Order berhasil ditambahkan!',
            data: order,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error('Error creating order:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan di server!',
            error: error.message,
        });
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const editedOrders = req.body;

        const order = await updateOrders(id, editedOrders);

        res.status(200).json({
            message: 'Order berhasil diperbarui!',
            data: order,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error('Error updating order:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan di server!',
            error: error.message,
        });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const order = await removeOrders(id);

        res.status(200).json({
            message: 'Order berhasil dihapus!',
            data: order,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error('Error deleting order:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan di server!',
            error: error.message,
        });
    }
});

module.exports = router;


const express = require('express');
const prisma = require('../db');

const { getProducts, getProductById, createProduct, updateProduct, removeProduct } = require('./product.service');
const { authMiddleware } = require('../middleware/middleware');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const products = await getProducts();

        res.status(200).json({
            message: 'Data produk berhasil didapatkan!',
            data: products,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal mendapatkan data produk!',
            error: error.message,
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await getProductById(id);

        if (!product) {
            return res.status(404).json({
                message: 'Data produk tidak ditemukan!',
            });
        }

        res.status(200).json({
            message: 'Data produk berhasil didapatkan!',
            data: product,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal mendapatkan data produk!',
            error: error.message,
        });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        if (!req.user.admin) {
            return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa menambahkan produk.' });
        }
        const newsProduct = req.body;
        const user_id = req.user.id;

        const product = await createNews(newsProduct, user_id);

        res.status(201).json({
            message: 'Berita berhasil ditambahkan!',
            data: product,
        });
    } catch (error) {
        return res.status(500).json({message: 'Gagal menambahkan product!', error: error.message});
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const editedProductData = req.body;

        if (!req.user.admin) {
            return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa mengedit produk.' });
        }

        const product = await updateProduct(id, editedProductData);

        res.status(200).json({
            message: 'Data produk berhasil diubah!',
            data: product,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal mengubah data produk!',
            error: error.message,
        });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.user.admin) {
            return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa menghapus produk.' });
        }

        const product = await removeProduct(id);

        res.status(200).json({
            message: 'Data produk berhasil dihapus!',
            data: product,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal menghapus data produk!',
            error: error.message,
        });
    }
});


module.exports = router;
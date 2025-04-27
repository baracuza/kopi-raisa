const express = require('express');
const prisma = require('../db');

const { getAllProducts, getProductById, createProduct, updateProduct, removeProduct } = require('./product.service');
const { authMiddleware } = require('../middleware/middleware');

const router = express.Router();



router.get('/', async (req, res) => {
    try {
        const products = await getAllProducts();

        console.log('data :',products);
        res.status(200).json({
            message: 'Data produk berhasil didapatkan!',
            data: products,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error('Error getting products:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan di server!',
            error: error.message,
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await getProductById(id);

        console.log('data:',product);
        res.status(200).json({
            message: 'Data produk berhasil didapatkan!',
            data: product,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error('Error getting product:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan di server!',
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

        console.log('data:',product);
        res.status(201).json({
            message: 'Berita berhasil ditambahkan!',
            data: product,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error('Error creating product:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan di server!',
            error: error.message
        });
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

        console.log(product);
        res.status(200).json({
            message: 'Data produk berhasil diubah!',
            data: product,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error('Error updating product:', error);
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
            return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa menghapus produk.' });
        }

        const product = await removeProduct(id);

        console.log(product);
        res.status(200).json({
            message: 'Data produk berhasil dihapus!',
            data: product,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error('Error deleting product:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan di server!',
            error: error.message,
        });
    }
});


module.exports = router;
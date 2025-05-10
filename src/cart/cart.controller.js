const express = require('express');
const ApiError = require('../utils/apiError');


const { authMiddleware } = require("../middleware/middleware");
const { addProductToCart, getCartUser, UpdateProductCart, deleteCartItem } = require("./cart.service");

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id
        const Carts = await getCartUser(userId);

        console.log('produk di keranjang :', Carts);
        res.status(200).json({
            message: 'Produk di keranjang berhasil didapatkan!',
            data: Carts,
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

router.post('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    console.log('Received data:', { productId, quantity });
    try {
        const item = await addProductToCart(parseInt(userId), parseInt(productId), parseInt(quantity));

        res.status(201).json({
            message: 'Produk berhasil ditambahkan ke keranjang!',
            data: item
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }
    }
});

router.put('/:id', authMiddleware, async(req, res) => {
    userId = req.user.id;
    const productId = parseInt(req.params.id);
    const { quantity } = req.body;

    try {
        const updateItem = await UpdateProductCart(parseInt(userId),parseInt(productId),parseInt(quantity))

        res.status(201).json({
            message:'Produk Dalam Keranjang Berhasil Diperbarui!',
            data: updateItem
        })

    } catch(error) {
        if(error instanceof ApiError){
            return res.status(error.statusCode).json({
                message: error.message,
            })
        }
    }
})

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        console.log('data remove:', { id, userId })
        const cartDelete = await deleteCartItem(userId, parseInt(id));

        if (!cartDelete) {
            return res.status(404).json({
                message: 'Produk tidak ditemukan di keranjang!'
            })
        }

        console.log('data dihapus:', cartDelete)
        res.status(200).json({
            message: 'Produk berhasil dihapus dari keranjang!',
            data: cartDelete
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error('Error deleting from cart:', error);
        res.status(500).json({
            message: 'Terjadi kesalahan saat menghapus dari keranjang!',
            error: error.message
        });
    }
});

module.exports = router;
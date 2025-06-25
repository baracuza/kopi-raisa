const express = require('express');
const prisma = require('../db');
const ApiError = require('../utils/apiError');
const upload = require('../middleware/multer');

const { getAllProducts, getProductById, createProduct, updateProduct, removeProductById } = require('./product.service');
const { authMiddleware, multerErrorHandler, validateProductMedia, validateProductUpdate } = require('../middleware/middleware');
const { productValidator } = require('../validation/validation');
const { validationResult } = require('express-validator');
const handleValidationResult = require('../middleware/handleValidationResult');
const handleValidationResultFinal = require('../middleware/handleValidationResultFinal');


const router = express.Router();



router.get('/', async (req, res) => {
    try {
        const products = await getAllProducts();

        const formatedProducts = products.map(product =>({
            idProduct: product.id,
            nameProduct: product.name,
            priceProduct: product.price,
            descriptionProduct: product.description,
            stockProduct: product.inventory.stock,
            soldProduct: product.sold,
            imageProduct: product.image,

            partner:{
                idPartner: product.partner.id,
                namePartner: product.partner.name,
                ownerPartner: product.partner.owner_name,
                phoneNumberPartner: product.partner.phone_number,
                addressPartner: product.partner.address
            }
        }))
        console.log('data :', products);
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

        const formatedProductId = {
            idProduct: product.id,
            nameProduct: product.name,
            priceProduct: product.price,
            descriptionProduct: product.description,
            stockProduct: product.inventory.stock,
            soldProduct: product.sold,
            imageProduct: product.image,

            partner:{
                idPartner: product.partner.id,
                namePartner: product.partner.name,
                ownerPartner: product.partner.owner_name,
                phoneNumberPartner: product.partner.phone_number,
                // addressPartner: product.partner.address
            }
        }

        console.log('data:', product);
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

router.post('/', authMiddleware, upload.single('productFile'),
    multerErrorHandler, validateProductMedia, productValidator,
    handleValidationResult, handleValidationResultFinal,
    async (req, res) => {
        try {
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
            if (req.mediaValidationErrors && Object.keys(req.mediaValidationErrors).length > 0) {
                return res.status(400).json({
                    message: "Validasi gagal!",
                    errors: req.mediaValidationErrors
                });
            }

            if (!req.user.admin) {
                return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa mengakses.' });
            }
            const { name, weight, price, stock, description, partner_id } = req.body;
            const file = req.file;

            // Sanitize HTML untuk disimpan
            const cleanHtml = DOMPurify.sanitize(description || "");

            // Bersihkan konten dari tag HTML
            const plainDescription = description
                .replace(/<[^>]+>/g, "")
                .replace(/\s+/g, " ")
                .trim();

            if (!plainDescription) {
                return res.status(400).json({
                    message: "Validasi gagal!",
                    errors: { description: "*Deskripsi Tidak Boleh Kosong" }
                });
            }

            const product = await createProduct({
                name,
                price,
                weight: parseInt(weight),
                stock,
                description: cleanHtml,
                partner_id,
                image: file
            });

            console.log('data product:', product);
            res.status(201).json({
                message: 'Produk berhasil ditambahkan!',
                data: product,
            });
        } catch (error) {
            if (error instanceof ApiError) {
                // console.error('ApiError:', error);
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

router.put('/:id', authMiddleware, upload.single('productFile'), multerErrorHandler, productValidator, validateProductUpdate({ skipIfNoFile: true }), handleValidationResult, handleValidationResultFinal, async (req, res) => {
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    try {

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
            return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa mengedit produk.' });
        }

        const { id } = req.params;
        const dataProduct = req.body;


        const editedProductData = {
            ...dataProduct,
            productFile: req.file || null,
        };

        console.log('editedProductData:', editedProductData);
        const product = await updateProduct(parseInt(id), editedProductData);

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

router.delete('/:idProduct', authMiddleware, async (req, res) => {
    try {
        const { idProduct } = req.params;

        if (!req.user.admin) {
            return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa menghapus produk.' });
        }

        const product = await removeProductById(idProduct);

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
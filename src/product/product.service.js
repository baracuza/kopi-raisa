// Description: This file contains the product service which is responsible for handling business logic related to products.

const ApiError = require('../utils/apiError');

const { findAllProducts, createNewProduct, createInventory, findProductById, updateDataProduct, updateInventoryStock, deleteProductById, deleteInventoryByProductId } = require('./product.repository');
const { findPartnerById } = require('../partners/partner.repository');

const getAllProducts = async () => {
    const products = await findAllProducts();
    if (!products || products.length === 0) {
        throw new ApiError(404, 'Produk tidak tidak ada!');
    }
    return products;
}

const getProductById = async (productId) => {
    const product = await findProductById(productId);
    if (!product) {
        throw new ApiError(404, 'Produk tidak ditemukan!');
    }
}

const removeProductById = async (id) => {
    const existingProduct = await findProductById(id);
    if (!existingProduct) {
        throw new ApiError(404, 'Produk tidak ditemukan!');
    }

    // await deleteInventoryByProductId(id);

    const productData = await deleteProductById(id);
    if (!productData) {
        throw new ApiError(500, 'Gagal menghapus produk!');
    }
    return productData;
}

const createProduct = async (newProductData) => {
    try {
        const cleanProductData = {
            ...newProductData,
            price: parseInt(newProductData.price),
            partner_id: parseInt(newProductData.partner_id),
        };

        const stock = parseInt(newProductData.stock)

        const partnerExists = await findPartnerById(cleanProductData.partner_id);
        if (!partnerExists) {
            throw new ApiError(404, 'Partner tidak ditemukan!');
        }

        const productNewData = await createNewProduct(cleanProductData);
        if (!productNewData) {
            throw new ApiError(500, 'Gagal menambahkan produk!');
        }

        const inventoryData = {
            products_id: productNewData.id,
            stock: stock
        };

        await createInventory(inventoryData);
        return productNewData;
    } catch (error) {
        console.error('Error in createProduct:', error);
        throw new ApiError(500, 'Terjadi kesalahan saat menambahkan produk.' + (error.message || error));
    }
}

const updateProduct = async (id, updatedProductData) => {
    try {
        const product = await findProductById(id);
        if (!product) {
            throw new ApiError(404, 'Produk tidak ditemukan!');
        }

        const cleanProductData = {
            ...updatedProductData,
            price: updatedProductData.price !== undefined ? parseInt(updatedProductData.price) : undefined,
            partner_id: updatedProductData.partner_id !== undefined ? parseInt(updatedProductData.partner_id) : undefined,
        };
        delete cleanProductData.stock;

        if (cleanProductData.partner_id) {
            const partnerExists = await findPartnerById(cleanProductData.partner_id);
            if (!partnerExists) {
                throw new ApiError(404, 'Partner tidak ditemukan!');
            }
        }

        const updatedProduct = await updateDataProduct(id, cleanProductData);

        if (updatedProductData.stock !== undefined) {
            const stock = parseInt(updatedProductData.stock);
            await updateInventoryStock({
                products_id: updatedProduct.id,
                stock: stock,
            });
        }

        return updatedProduct;
    } catch (error) {
        console.error('Error in updateProduct:', error);
        throw new ApiError(500, 'Terjadi kesalahan saat memperbarui produk.' + (error.message || error));
    }
}

module.exports = { getAllProducts, createProduct, updateProduct, getProductById, removeProductById };
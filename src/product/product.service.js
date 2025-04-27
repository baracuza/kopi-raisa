// Description: This file contains the product service which is responsible for handling business logic related to products.

const ApiError = require('../utils/apiError');

const { findAllProducts, createNewProduct, createInventory } = require('./product.repository');

const getAllProducts = async () => {
    const products = await findAllProducts();
    if (!products || products.length === 0) {
        throw new ApiError(404, 'Produk tidak tidak ada!');
    }
    return products;
}

const createProduct = async (newProductData) => {
    try {
        const productNewData = await createNewProduct(newProductData);
        if (!productNewData) {
            throw new ApiError(500, 'Gagal menambahkan produk!');
        }

        const inventoryData = {
            products_id: productNewData.id,
            stock: productNewData.stock
        };

        await createInventory(inventoryData);
        return productNewData;
    } catch (error) {
        console.error('Error in createProduct:', error);
        throw new ApiError(500, 'Terjadi kesalahan saat menambahkan produk.' + (error.message || error));
    }
}

module.exports = { getAllProducts, createProduct };
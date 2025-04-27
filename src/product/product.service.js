// Description: This file contains the product service which is responsible for handling business logic related to products.

const ApiError = require('../utils/apiError');

const {findProducts, getProductById, createProduct, updateProduct, removeProduct} = require('./product.repository');

const getAllProducts = async () => {
    const products = await findAllProducts();
    if (!products) {
        throw new ApiError(404,'Produk tidak tidak ada!');
    }
    return products;
}


module.exports = {getAllProducts};
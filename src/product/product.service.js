const prisma = require('../db');

const {findProducts, getProductById, createProduct, updateProduct, removeProduct} = require('./product.repository');

const getProducts = async () => {
    const products = await findProducts();

    return products;
}


module.exports = {getProducts};
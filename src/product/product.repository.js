
const prisma = require('../db');


const findAllProducts = async () => {
    const products = await prisma.Product.findMany();

    return products;
};


module.exports = {findAllProducts};
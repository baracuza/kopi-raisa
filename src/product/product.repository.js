const prisma = require('../db');


const findProducts = async () => {
    const products = await prisma.Product.findMany();

    return products;
};


module.exports = {findProducts};
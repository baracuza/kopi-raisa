
const prisma = require('../db');


const findAllProducts = async () => {
    const products = await prisma.Product.findMany();

    return products;
};

const createNewProduct = async (newProductData) => {
    const productNewData = await prisma.Product.create({
        data: newProductData,
    });
    return productNewData;
};

const createInventory = async (inventoryProduct) => {
    const inventoryData = await prisma.Inventory.create({
        data:inventoryProduct,
    });
    return inventoryData;
};
module.exports = {findAllProducts, createNewProduct, createInventory};
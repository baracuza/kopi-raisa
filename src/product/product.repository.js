
const prisma = require('../db');


const findAllProducts = async () => {
    const products = await prisma.Product.findMany();

    return products;
};

const deleteProductById = async (id) => {
    const product = await prisma.product.delete({
        where: {
            id: parseInt(id),
        },
    });
    return product;
}

const deleteInventoryByProductId = async (productId) => {
    return await prisma.inventory.delete({
        where: {
            products_id: parseInt(productId),
        },
    });
};


const createNewProduct = async (newProductData) => {
    const productNewData = await prisma.product.create({
        data: {
            name: newProductData.name,
            price: newProductData.price,
            description: newProductData.description,
            partner: {
                connect: {
                    id: newProductData.partner_id,
                },
            },
        }
    });
    return productNewData;
};

const createInventory = async (inventoryProduct) => {
    const inventoryData = await prisma.inventory.create({
        data: {
            stock: inventoryProduct.stock,
            product: {
                connect: {
                    id: inventoryProduct.products_id,
                },
            },
        }
    });
    return inventoryData;
};

const findProductById = async (id) => {
    const product = await prisma.product.findUnique({
        where: {
            id: parseInt(id),
        },
    });
    return product;
};

const updateDataProduct = async (id, updatedProductData) => {
    const { partner_id, ...restData } = updatedProductData;

    const updatedProduct = await prisma.product.update({
        where: {
            id: parseInt(id),
        },
        data: {
            ...restData,
            ...(partner_id && {
                partner: {
                    connect: {
                        id: partner_id,
                    },
                },
            }),
        },
    });
    return updatedProduct;
};

const updateInventoryStock = async (inventoryData) => {
    const updatedInventory = await prisma.inventory.update({
        where: {
            products_id: inventoryData.products_id,
        },
        data: {
            stock: inventoryData.stock,
        },
    });
    return updatedInventory;
}
module.exports = { findAllProducts, createNewProduct, createInventory, findProductById, updateDataProduct, updateInventoryStock, deleteProductById, deleteInventoryByProductId };
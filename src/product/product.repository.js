
const prisma = require('../db');


const findAllProducts = async () => {
    // Ambil semua produk
    const products = await prisma.product.findMany({
        include: {
            inventory: {
                select: {
                    stock: true,
                }
            },
            partner: true,
        }
    });

    // Hitung total terjual berdasarkan products_id dari order yang berstatus DELIVERED
    const soldQuantities = await prisma.orderItem.groupBy({
        by: ['products_id'],
        where: {
            order: {
                status: 'DELIVERED',
            },
        },
        _sum: {
            quantity: true,
        },
    });

    // Gabungkan data produk dengan penjualan
    const productsWithSales = products.map((product) => {
        const soldData = soldQuantities.find(sq => sq.products_id === product.id);
        return {
            ...product,
            sold: soldData?._sum?.quantity || 0,
        };
    });

    return productsWithSales;
};


const deleteProductById = async (idProduct) => {
    const product = await prisma.product.delete({
        where: {
            id: parseInt(idProduct),
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
            image: newProductData.image || null,
            weight: newProductData.weight,
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

const findProductById = async (idProduct) => {
    const product = await prisma.product.findUnique({
        where: {
            id: parseInt(idProduct),
        },
        include: {
            partner: true,
            inventory: {
                select: {
                    stock: true
                }
            }
        }
    });

    if (!product) return null;

    // Hitung total terjual berdasarkan products_id dari order yang berstatus DELIVERED
    const soldQuantities = await prisma.orderItem.aggregate({
        where:{
            products_id: parseInt(idProduct),
            order:{
                status:"DELIVERED",
            }
        },
        _sum:{
            quantity: true,
        }
    });

    return {
        ...product,
        sold: soldQuantities._sum.quantity || 0,
    };
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

const getProductsByIds = async (productIds) => {
    return await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: {
            partner: true,
            inventory: {
                select: {
                    stock: true,
                }
            }
        },
    });
};

module.exports = {
    findAllProducts, createNewProduct, createInventory,
    findProductById, updateDataProduct, updateInventoryStock,
    deleteProductById, deleteInventoryByProductId, getProductsByIds
};
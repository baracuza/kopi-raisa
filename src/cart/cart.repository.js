const prisma = require("../db")

const findAllCart = async (userId) => {
    return await prisma.cart.findMany({
        where: {
            user_id: userId,
        },
        include: {
            cartItems: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            description: true,
                            image: true,
                            weight: true,
                            partner: true,
                            inventory: {
                                select: {
                                    stock: true,
                                }
                            }
                        }
                    },
                }
            },
        }
    })
}

const findCartByUserId = async (userId) => {
    return await prisma.cart.findUnique({
        where: {
            user_id: userId,
        },
        include: {
            cartItems: true,
        },
    });
}

const findProductByIdAndCart = async (cartId, productId) => {
    return await prisma.cartItem.findFirst({
        where: {
            cart_id: cartId,
            products_id: productId,
        },
    });
}

const findCartItemByProduct = async (cartId, productId) => {
    return await prisma.cartItem.findFirst({
        where: {
            cart_id: cartId,
            products_id: productId,
        },
    });
};

// update quantity
const updateCartItemQuantity = async (cartItemId, newQuantity) => {
    return await prisma.cartItem.update({
        where: {
            id: cartItemId,
        },
        data: {
            quantity: newQuantity,
        },
    });
}

const createCart = async (userId) => {
    return await prisma.cart.create({
        data: {
            user_id: userId,
        },
    });
};

const createCartItem = async (cartId, productId, quantity) => {
    return await prisma.cartItem.create({
        data: {
            cart: { connect: { id: cartId } },
            product: { connect: { id: productId } },
            quantity,
        },
    });
};

const deleteCartItems = async (userId, productIds) => {
    await prisma.cartItem.deleteMany({
        where: {
            user_id: userId,
            product_id: { in: productIds },
        },
    });
};

const removeCartItem = async (cartItemId) => {
    return await prisma.cartItem.delete({
        where: { id: cartItemId },
    });
};

module.exports = {
    findAllCart,
    findCartByUserId,
    createCart,
    createCartItem,
    findProductByIdAndCart,
    updateCartItemQuantity,
    removeCartItem,
    findCartItemByProduct,
    deleteCartItems
    // deleteCartItemById,
    // deleteCartById,
    // updateCartItemQuantity,
    // updateCartItemStatus
}
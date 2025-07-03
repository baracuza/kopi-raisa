const { findProductById } = require("../product/product.repository");
const ApiError = require("../utils/apiError");
const {
    findAllCart, findCartByUserId, findProductByIdAndCart,
    removeCartItem, findCartItemByProduct, updateCartItemQuantity,
    createCart, createCartItem } = require("./cart.repository");


const getCartUser = async (userId) => {
    try {
        const CartData = await findAllCart(userId);
        if (!CartData) {
            throw new ApiError(404, 'Keranjang tidak ditemukan!');
        }

        return CartData;
    } catch (error) {
        console.error('Error in getAllCart:', error);
        throw new ApiError(500, (error.message || error));

    }
}

const addProductToCart = async (userId, productId, quantity) => {
    try {
        console.log('addProductToCart args:', { userId, productId, quantity });
        console.log('Tipe:', {
            userId: typeof userId,
            productId: typeof productId,
            quantity: typeof quantity,
        });

        const product = await findProductById(productId)
        if (!product) {
            throw new ApiError(404, 'Produk tidak ditemukan!')
        }

        const availableStock = product.inventory?.stock ?? 0;

        let cart = await findCartByUserId(userId);

        if (!cart) {
            cart = await createCart(userId);
        }
        const existingItem = await findProductByIdAndCart(cart.id, productId);
        if (existingItem) {

            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > availableStock) {
                throw new ApiError(400, `Stok produk tidak mencukupi. Sisa stok: ${availableStock}, Anda sudah memiliki ${existingItem.quantity} di keranjang.`);
            }
            const updatedItem = await updateCartItemQuantity(existingItem.id, newQuantity);
            return updatedItem;
        } else {
            const newItem = await createCartItem(cart.id, productId, quantity);
            return newItem;
        }
    } catch (error) {
        console.error('Error in addProductToCart:', error);

        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, (error.message || error));
    }
};

const UpdateProductCart = async (userId, productId, quantity) => {
    try {
        const cart = await findCartByUserId(userId);
        if (!cart) {
            throw new ApiError(404, 'Keranjang tidak ditemukan!');
        }

        const cartItem = await findProductByIdAndCart(cart.id, productId);
        if (!cartItem) {
            throw new ApiError(404, 'Produk tidak ada dalam keranjang!');
        }

        const updatedItem = await updateCartItemQuantity(cartItem.id, quantity);
        return updatedItem;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, (error.message || error));
    }
}

const deleteCartItem = async (userId, productId) => {
    try {
        const cart = await findCartByUserId(userId);
        if (!cart) {
            return null
        }

        const cartItem = await findCartItemByProduct(cart.id, productId);
        if (!cartItem) {
            return null
        };

        return await removeCartItem(cartItem.id);
    } catch (error) {
        console.error('Error remove product Cart:', error);
        throw new ApiError(500, (error.message || error));
    }

}

module.exports = {
    getCartUser,
    addProductToCart,
    UpdateProductCart,
    deleteCartItem
};
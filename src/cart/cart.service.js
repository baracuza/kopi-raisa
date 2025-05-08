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
        let cart = await findCartByUserId(userId);

        if (!cart) {
            cart = await createCart(userId);
        }
        const existingItem = await findProductByIdAndCart(cart.id, productId);
        if (existingItem) {

            const newQuantity = existingItem.quantity + quantity;
            const updatedItem = await updateCartItemQuantity(existingItem.id, newQuantity);
            return updatedItem;
        } else {
            const newItem = await createCartItem(cart.id, productId, quantity);
            return newItem;
        }
    } catch (error) {
        console.error('Error in addProductToCart:', error);
        throw new ApiError(500, (error.message || error));
    }
};

const deleteCartItem = async (userId, productId) => {
    try {
        const cart = await findCartByUserId(userId);
    if (!cart){
        throw new ApiError(404, 'Produk tidak ditemukan di keranjang!');
    }

    const cartItem = await findCartItemByProduct(cart.id, productId);
    if (!cartItem){
        throw new ApiError(404,'Produk tidak ditemukan di keranjang!')
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
    deleteCartItem
};
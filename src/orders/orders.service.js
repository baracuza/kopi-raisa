const ApiError = require('../utils/apiError');

const {
    findOrders,
    findOrdersById,
    insertNewOrders,
    editOrders,
    deleteOrders,
    findOrdersByPartnerId,
    findOrdersByUserId,
    findOrdersByStatus,
} = require('./orders.repository');

const getAllOrders = async () => {
    const orders = await findOrders();
    if (!orders) {
        throw new ApiError(500, 'Gagal mendapatkan data order!');
    }
    return orders;
};

const getOrdersById = async (orderId) => {
    const order = await findOrdersById(orderId);
    if (!order) {
        throw new ApiError(404, 'Order tidak ditemukan!');
    }

    return order;
};

const createOrders = async (newOrdersData) => {
    const ordersNewData = await insertNewOrders(newOrdersData);

    return ordersNewData;
};

const updateOrders = async (id, editedOrdersData) => {
    const existingOrders = await findOrdersById(id);
    if (!existingOrders) {
        throw new ApiError(404, 'Order tidak ditemukan!');
    }

    const ordersData = await editOrders(id, editedOrdersData);

    return ordersData;
};

const removeOrders = async (id) => {
    const existingOrders = await findOrdersById(id);

    if (!existingOrders) {
        throw new ApiError(404, 'Order tidak ditemukan!');
    }
    const ordersData = await deleteOrders(id);

    if (!ordersData) {
        throw new ApiError(500, 'Gagal menghapus order!');
    }
    return ordersData;
};

const getOrdersByPartnerId = async (partnerId) => {
    const orders = await findOrdersByPartnerId(partnerId);
    if (!orders) {
        throw new ApiError(404, 'Order tidak ditemukan!');
    }
    return orders;
};

const getOrdersByUserId = async (userId) => {
    const orders = await findOrdersByUserId(userId);
    if (!orders) {
        throw new ApiError(404, 'Order tidak ditemukan!');
    }
    return orders;
};

const getOrdersByStatus = async (status) => {
    const orders = await findOrdersByStatus(status);
    if (!orders) {
        throw new ApiError(404, 'Order tidak ditemukan!');
    }
    return orders;
};

module.exports = {
    getAllOrders,
    getOrdersById,
    createOrders,
    updateOrders,
    removeOrders,
    getOrdersByPartnerId,
    getOrdersByUserId,
    getOrdersByStatus,
};


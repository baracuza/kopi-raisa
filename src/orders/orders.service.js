const ApiError = require('../utils/apiError');
const { notifyPartnerOnPurchase } = require('../utils/whatsapp');

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

const notifyPartnerForOrder = async (orderId, message) => {
    const order = await findOrdersById(orderId);
    if (!order) {
        throw new ApiError(404, 'Order tidak ditemukan!');
    }

    const partnerId = order.partnerId;
    if (!partnerId) {
        throw new ApiError(400, 'Partner ID tidak ditemukan pada order!');
    }

    const notificationResult = await notifyPartnerOnPurchase(
        partnerId,
        message
    );
    if (!notificationResult) {
        throw new ApiError(500, 'Gagal mengirim notifikasi ke partner!');
    }

    return notificationResult;
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
    notifyPartnerForOrder,
};


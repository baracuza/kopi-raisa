const prisma = require('../prisma');
const ApiError = require('../utils/apiError');

const findOrders = async () => {
    const orders = await prisma.Orders.findMany({
        include: {
            OrderItem: true,
            User: true,
            Partner: true,
        },
    });
    return orders;
}

const findOrdersById = async (orderId) => {
    const order = await prisma.Orders.findUnique({
        where: {
            id: parseInt(orderId),
        },
        include: {
            OrderItem: true,
            User: true,
            Partner: true,
        },
    });
    return order;
};

const insertNewOrders = async (newOrdersData) => {
    const orders = await prisma.Orders.create({
        data: {
            user_id: newOrdersData.user_id,
            partner_id: newOrdersData.partner_id,
            total_price: newOrdersData.total_price,
            status: newOrdersData.status,
            OrderItem: {
                create: newOrdersData.OrderItem,
            },
        },
        include: {
            OrderItem: true,
            User: true,
            Partner: true,
        },
    });
    return orders;
};

const editOrders = async (id, editedOrdersData) => {
    const orders = await prisma.Orders.update({
        where: {
            id: parseInt(id),
        },
        data: editedOrdersData,
        include: {
            OrderItem: true,
            User: true,
            Partner: true,
        },
    });
    return orders;
};

const deleteOrders = async (id) => {
    const orders = await prisma.Orders.delete({
        where: {
            id: parseInt(id),
        },
    });
    return orders;
};

const findOrdersByUserId = async (userId) => {
    const orders = await prisma.Orders.findMany({
        where: {
            user_id: parseInt(userId),
        },
        include: {
            OrderItem: true,
            User: true,
            Partner: true,
        },
    });
    return orders;
};

const findOrdersByPartnerId = async (partnerId) => {
    const orders = await prisma.Orders.findMany({
        where: {
            partner_id: parseInt(partnerId),
        },
        include: {
            OrderItem: true,
            User: true,
            Partner: true,
        },
    });
    return orders;
};

const findOrdersByStatus = async (status) => {
    const orders = await prisma.Orders.findMany({
        where: {
            status: status,
        },
        include: {
            OrderItem: true,
            User: true,
            Partner: true,
        },
    });
    return orders;
};

module.exports = {
    findOrders,
    findOrdersById,
    insertNewOrders,
    editOrders,
    deleteOrders,
    findOrdersByUserId,
    findOrdersByPartnerId,
    findOrdersByStatus,
};
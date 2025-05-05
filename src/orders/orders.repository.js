const prisma = require('../db');

const findOrders = async () => {
    const orders = await prisma.Order.findMany({
        // include: {
        //     OrderItem: true,
        //     User: true,
        //     Partner: true,
        // },
    });
    return orders;
}

const findOrdersById = async (orderId) => {
    const order = await prisma.Order.findUnique({
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
    const orders = await prisma.Order.create({
        data: {
            user_id: newOrdersData.user_id,
            partner_id: newOrdersData.partner_id,
            status: newOrdersData.status,
            orderItems: {
                create: newOrdersData.orderItems.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price,
                    custome_note: item.custom_note,
                })),
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
    const orders = await prisma.Order.update({
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
    const orders = await prisma.Order.delete({
        where: {
            id: parseInt(id),
        },
    });
    return orders;
};

const findOrdersByUserId = async (userId) => {
    const orders = await prisma.Order.findMany({
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
    const orders = await prisma.Order.findMany({
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
    const orders = await prisma.Order.findMany({
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
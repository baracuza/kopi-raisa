const prisma = require("../db");

// const findOrders = async () => {
//     const orders = await prisma.Order.findMany({
//         // include: {
//         //     OrderItem: true,
//         //     User: true,
//         //     Partner: true,
//         // },
//     });
//     return orders;
// }

// const findOrdersById = async (orderId) => {
//     const order = await prisma.Order.findUnique({
//         where: {
//             id: parseInt(orderId),
//         },
//         include: {
//             OrderItem: true,
//             User: true,
//             Partner: true,
//         },
//     });
//     return order;
// };

// const insertNewOrders = async (newOrdersData) => {
//     const orders = await prisma.Order.create({
//         data: {
//             user_id: newOrdersData.user_id,
//             partner_id: newOrdersData.partner_id,
//             status: newOrdersData.status,
//             OrderItem: newOrdersData.orderItems && Array.isArray(newOrdersData.orderItems) ? {
//                 create: newOrdersData.orderItems.map((item) => ({
//                     products_id: item.products_id,
//                     quantity: item.quantity,
//                     price: item.price,
//                     custom_note: item.custom_note,
//                 })),
//             } : undefined,
//         },
//         include: {
//             OrderItem: true,
//             User: true,
//             Partner: true,
//         },
//     });
//     return orders;
// };

// const editOrders = async (id, editedOrdersData) => {
//     const orders = await prisma.Order.update({
//         where: {
//             id: parseInt(id),
//         },
//         data: editedOrdersData,
//         include: {
//             OrderItem: true,
//             User: true,
//             Partner: true,
//         },
//     });
//     return orders;
// };

// const deleteOrders = async (id) => {
//     const orders = await prisma.Order.delete({
//         where: {
//             id: parseInt(id),
//         },
//     });
//     return orders;
// };

// const findOrdersByUserId = async (userId) => {
//     const orders = await prisma.Order.findMany({
//         where: {
//             user_id: parseInt(userId),
//         },
//         include: {
//             OrderItem: true,
//             User: true,
//             Partner: true,
//         },
//     });
//     return orders;
// };

// const findOrdersByPartnerId = async (partnerId) => {
//     const orders = await prisma.Order.findMany({
//         where: {
//             partner_id: parseInt(partnerId),
//         },
//         include: {
//             OrderItem: true,
//             User: true,
//             Partner: true,
//         },
//     });
//     return orders;
// };

// const findOrdersByStatus = async (status) => {
//     const orders = await prisma.Order.findMany({
//         where: {
//             status: status,
//         },
//         include: {
//             OrderItem: true,
//             User: true,
//             Partner: true,
//         },
//     });
//     return orders;
// };

// module.exports = {
//     findOrders,
//     findOrdersById,
//     insertNewOrders,
//     editOrders,
//     deleteOrders,
//     findOrdersByUserId,
//     findOrdersByPartnerId,
//     findOrdersByStatus,
// };

const findAllOrders = async () => {
    return await prisma.order.findMany({
        include: {
            user: { select: { id: true, name: true, email: true } },
            partner: { select: { id: true, name: true, owner_name: true } },
            orderItems: {
                include: {
                    product: { select: { id: true, name: true, price: true } },
                },
            },
            shippingAddress: true,
            payment: true,
        },
        orderBy: { created_at: "desc" },
    });
};

const findOrdersByUser = async (userId, status) => {
    let statusFilter = {};
    if (status === "diproses") {
        statusFilter = { status: { in: ["PENDING", "DIKIRIM", "DIBATALKAN"] } };
    } else if (status === "selesai") {
        statusFilter = { status: "SELESAI" };
    }

    return await prisma.order.findMany({
        where: {
            user_id: userId,
            ...statusFilter,
        },
        include: {
            partner: { select: { id: true, name: true } },
            orderItems: {
                include: {
                    product: { select: { id: true, name: true, price: true } },
                },
            },
            shippingAddress: true,
            payment: true,
        },
        orderBy: { created_at: "desc" },
    });
};

const insertNewOrders = async (userId, {partner_id, items, address, paymentMethod, totalAmount }) => {
    return await prisma.order.create({
        data: {
            user: { connect: { id: userId } },
            partner: { connect: { id: partner_id } },
            status: 'PENDING',
            orderItems: {
                create: items.map(item => ({
                    product: { connect: { id: item.products_id } },
                    quantity: item.quantity,
                    price: item.price,
                    custom_note: item.custom_note || null,
                })),
            },
            shippingAddress: {
                create: {
                    address: address,
                },
            },
            payment: {
                create: {
                    amount: totalAmount,
                    method: paymentMethod,
                    status: 'PENDING',
                },
            },
        },
        include: {
            orderItems: true,
            shippingAddress: true,
            payment: true,
        },
    });
};

module.exports = {
    findAllOrders,
    findOrdersByUser,
    insertNewOrders,
};

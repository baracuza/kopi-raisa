const prisma = require("../db");

const findAllOrders = async (statusFilter) => {
    return prisma.order.findMany({
        where: {
            ...(statusFilter?.length > 0 && {
                status: { in: statusFilter },
            }),
        },
        include: {
            user: true,
            orderItems: {
                include: {
                    product: true,
                    partner: true,
                },
            },
            shippingAddress: true,
            payment: true,
            OrderCancellation: true,
        },
        orderBy: {
            created_at: "desc",
        },
    });
};

const findOrdersByUser = async (userId, statusFilter) => {
    return prisma.order.findMany({
        where: {
            user_id: userId,
            ...(statusFilter?.length > 0 && {
                status: { in: statusFilter },
            }),
        },
        include: {
            orderItems: {
                include: {
                    product: true,
                    partner: true,
                },
            },
            shippingAddress: true,
            payment: true,
            OrderCancellation: true,
        },
        orderBy: {
            created_at: "desc",
        },
    });
};


const findOrderDetailById = async (orderId) => {
    return prisma.order.findUnique({
        where: { id: parseInt(orderId) },
        include: {
            user: true,
            shippingAddress: true,
            orderItems: {
                include: {
                    product: true,
                    partner: true,
                },
            },
            payment: true,
        },
    });
};

const findOrdersById = async (orderId) => {
    return await prisma.order.findUnique({
        where: { id: parseInt(orderId) },
    });
};

const findOrdersByPartnerId = async (partnerId) => {
    return await prisma.orderItem.findMany({
        where: {
            partner_id: parseInt(partnerId),
            notified_to_partner_at: null,
            order: {
                status: "PENDING",
            },
        },
        include: {
            product: true,
            order: {
                include: {
                    user: true,
                },
            },
            partner: true,
        },
    });
};

const markOrderItemsAsNotified = async (itemIds) => {
    if (!itemIds.length) return;

    // Update orderItem: set notified_to_partner_at
    await prisma.orderItem.updateMany({
        where: {
            id: { in: itemIds },
        },
        data: {
            notified_to_partner_at: new Date(),
        },
    });

    // Ambil order_id unik dari itemIds
    const relatedOrderItems = await prisma.orderItem.findMany({
        where: {
            id: { in: itemIds },
        },
        select: {
            order_id: true,
        },
    });

    const orderIds = [
        ...new Set(relatedOrderItems.map((item) => item.order_id)),
    ];

    // Update semua order terkait: set status ke PROCESSING
    if (orderIds.length > 0) {
        await prisma.order.updateMany({
            where: {
                id: { in: orderIds },
            },
            data: {
                status: "PROCESSING",
            },
        });
    }
};

const findAllComplietedOrders = async () => {
    return prisma.order.findMany({
        where: {
            status: "DELIVERED", // Atau status lain yang dianggap selesai
        },
        include: {
            user: true,
            orderItems: {
                include: {
                    product: {
                        include: {
                            partner: true,
                        },
                    },
                },
            },
            shippingAddress: true,
        },
        orderBy: {
            created_at: "desc",
        },
    });
};

const findUserComplietedOrders = async (userId) => {
    return prisma.order.findMany({
        where: {
            user_id: userId,
            status: "DELIVERED",
        },
        include: {
            orderItems: {
                include: {
                    product: {
                        include: {
                            partner: true,
                        },
                    },
                },
            },
            shippingAddress: true,
        },
        orderBy: {
            created_at: "desc",
        },
    });
};

const insertNewOrders = async (
    userId, { items, address, paymentMethod, totalAmount }
) => {
    return await prisma.order.create({
        data: {
            user: { connect: { id: userId } },
            status: "PENDING",
            orderItems: {
                create: items.map((item) => ({
                    product: { connect: { id: item.products_id } },
                    quantity: item.quantity,
                    price: item.price,
                    custom_note: item.custom_note || null,
                    partner: item.partner_id ? { connect: { id: item.partner_id } } : undefined,
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
                    status: "PENDING",
                },
            },
        },
        include: {
            user: true,
            orderItems: {
                include: {
                    product: {
                        include: {
                            partner: true,
                        },
                    }
                },
            },
            shippingAddress: true,
            payment: true,
        },

    });
};

const updatePaymentSnapToken = async (orderId, snapToken, snapRedirectUrl) => {
    // Ambil payment ID dari order
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { payment: true },
    });

    if (!order || !order.payment) {
        throw new Error("Order atau payment tidak ditemukan!");
    }

    // Update snap_token di payment
    await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
            snap_token: snapToken,
            snap_redirect_url: snapRedirectUrl || null,
        },
    });

    // Ambil ulang order lengkap setelah update
    const updatedOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: true,
            orderItems: {
                include: {
                    product: {
                        include: {
                            partner: true,
                        },
                    },
                },
            },
            shippingAddress: true,
            payment: true,
        },
    });

    return updatedOrder;
};

const updateOrderPaymentStatus = async (orderId, { payment_status, payment_method }) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { payment: true },
    });

    if (!order) {
        console.error(`Order dengan ID ${orderId} tidak ditemukan`);
        throw new Error(`Order dengan ID ${orderId} tidak ditemukan`);
    }

    if (!order.payment) {
        console.error(`Order dengan ID ${orderId} belum memiliki data pembayaran`);
        throw new Error(`Order dengan ID ${orderId} belum memiliki data pembayaran`);
    }

    return await prisma.payment.update({
        where: { order_id: orderId },
        data: {
            status: payment_status,
            method: payment_method,
        },
    });
};


const updateStatusOrders = async (orderId, newStatus) => {
    return await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: {
            status: newStatus,
            updated_at: new Date(),
        },
    });
};

const createOrderCancellation = async (orderId, userId, reason) => {
    return await prisma.orderCancellation.create({
        data: {
            order_id: orderId,
            user_id: userId,
            reason: reason,
        },
    });
};

const createNotification = async ({ user_id, name, description }) => {
    return await prisma.notification.create({
        data: {
            user_id,
            name,
            description,
        },
    });
};

const updateItemOrders = async (orderId, updatedData) => {
    return await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: updatedData,
    });
};

const deleteOrders = async (orderId) => {
    return await prisma.order.delete({
        where: { id: parseInt(orderId) },
    });
};

const getProductsByCartItem = async (cartItemIds) => {
    return await prisma.cartItem.findMany({
        where: { id: { in: cartItemIds } },
        include: {
            product: {
                include: {
                    partner: true,
                    inventory: {
                        select: {
                            stock: true,
                        }
                    }
                }
            }
        },
    });
};

const findProductsByIds = async (productIds) => {
    const products = await prisma.product.findMany({
        where: {
            id: { in: productIds.map(id => parseInt(id)) },
        },
        select:{
            id:true,
        }
    });
    return products.map(product => product.id);
};


module.exports = {
    findAllOrders,
    findOrdersByUser,
    findOrdersById,
    findAllComplietedOrders,
    findUserComplietedOrders,
    findOrdersByPartnerId,
    findOrderDetailById,
    getProductsByCartItem,
    insertNewOrders,
    markOrderItemsAsNotified,
    updatePaymentSnapToken,
    updateOrderPaymentStatus,
    updateStatusOrders,
    updateItemOrders,
    deleteOrders,
    createOrderCancellation,
    createNotification,
};
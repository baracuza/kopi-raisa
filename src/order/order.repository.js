const prisma = require("../db");

const findAllOrders = async () => {
    return await prisma.order.findMany({
        include: {
            user: { select: { id: true, name: true, email: true } },
            orderItems: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            partner: {
                                select: {
                                    id: true,
                                    name: true,
                                    owner_name: true
                                }
                            },
                        }
                    },
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
            orderItems: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            partner: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            },
                        }
                    },
                },
            },
            shippingAddress: true,
            payment: true,
        },
        orderBy: { created_at: "desc" },
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
    return await prisma.order.findMany({
        where: {
            partner_id: parseInt(partnerId),
            status: {
                not: "CANCELED",
            },
        },
        include: {
            orderItems: {
                include: {
                    product: true,
                },
            },
            partner: true,
            user: true,
        },
    });
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
    return await prisma.order.update({
        where: { id: orderId },
        data: {
            payment: {
                update: {
                    status: payment_status,
                    method: payment_method,
                },
            },
        },
    });
};



const updateStatusOrders = async (orderId, newStatus) => {
    return await prisma.order.update({
        where: { id: orderId },
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

module.exports = {
    findAllOrders,
    findOrdersByUser,
    findOrdersById,
    findAllComplietedOrders,
    findUserComplietedOrders,
    findOrdersByPartnerId,
    findOrderDetailById,
    insertNewOrders,
    updatePaymentSnapToken,
    updateOrderPaymentStatus,
    updateStatusOrders,
    updateItemOrders,
    deleteOrders,
    createOrderCancellation,
    createNotification,
};
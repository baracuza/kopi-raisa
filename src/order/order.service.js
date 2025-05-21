const ApiError = require("../utils/apiError");
const { generatePartnerOrderNotification } = require("../utils/whatsapp");
const { OrderStatus } = require("@prisma/client");
const { getProductsByIds } = require("../product/product.repository");
const { createMidtransSnapToken } = require("../utils/midtrans");

const {
    findAllOrders,
    findOrdersByUser,
    findOrdersById,
    findAllComplietedOrders,
    findUserComplietedOrders,
    findOrdersByPartnerId,
    insertNewOrders,
    updatePaymentSnapToken,
    updateOrderPaymentStatus,
    updateStatusOrders,
    updateItemOrders,
    deleteOrders,
} = require("./order.repository");

const getAllOrders = async () => {
    const orders = await findAllOrders();
    if (!orders) {
        throw new ApiError(500, "Gagal mendapatkan data order!");
    }
    return orders;
};

const getOrdersByUser = async (userId, status) => {
    const orders = await findOrdersByUser(userId, status);
    if (!orders) {
        throw new ApiError(404, "Order tidak ditemukan!");
    }
    return orders;
};

const getCompleteOrderByRole = async (userId, role) => {
    if (role === "admin") {
        return await findAllComplietedOrders();
    } else {
        return await findUserComplietedOrders(userId);
    }
};

const createOrders = async (userId, orderData) => {
    const { items, address, paymentMethod } = orderData;

    if (!items || items.length === 0)
        throw new ApiError(404, "Pesanan tidak boleh kosong");
    if (!address || !paymentMethod)
        throw new ApiError(404, "Alamat dan metode pembayaran wajib diisi");

    const productIds = items.map((item) => item.products_id);
    const products = await getProductsByIds(productIds);

    if (products.length !== items.length) {
        throw new ApiError(404, "Beberapa produk tidak ditemukan di database");
    }

    let totalAmount = 0;
    const itemsWithPrice = items.map((item) => {
        const product = products.find((p) => p.id === item.products_id);
        if (!product)
            throw new ApiError(404, `Produk dengan ID ${item.products_id} tidak ditemukan`);
        if (!product.partner?.id)
            throw new ApiError(400, `Produk ID ${product.id} belum memiliki partner!`);

        const pricePerUnit = product.price;
        const subtotal = pricePerUnit * item.quantity;
        totalAmount += subtotal;

        return {
            products_id: item.products_id,
            quantity: item.quantity,
            price: pricePerUnit,
            custom_note: item.custom_note || null,
            partner_id: product.partner?.id ?? null
        };
    });

    const orders = await insertNewOrders(userId, {
        items: itemsWithPrice,
        address,
        paymentMethod,
        totalAmount: parseInt(totalAmount),
    });

    if (!orders) throw new ApiError(500, "Gagal membuat order!");

    const midtransResult = await createMidtransSnapToken(orders);

    let snapToken = null;
    let snapRedirectUrl = null;

    if (orders.payment.method === "QRIS") {
        snapRedirectUrl = midtransResult.qrUrl;
    } else {
        snapToken = midtransResult.token;
        snapRedirectUrl = midtransResult.redirectUrl;
    }

    const updatedOrder = await updatePaymentSnapToken(orders.id, snapToken ?? snapRedirectUrl, snapRedirectUrl);
    return {
        updatedOrder,
        paymentInfo: {
            type: orders.payment.method === "QRIS" ? "qris" : "snap",
            snapToken,
            snapRedirectUrl,
        }
    };
};

const handleMidtransNotification = async (notification) => {
    const {
        transaction_status,
        payment_type,
        order_id,
        fraud_status,
    } = notification;

    // Extract orderId dari order_id Midtrans → "ORDER-123-..."
    const idMatch = order_id.match(/ORDER-(\d+)-/);
    const orderId = idMatch ? parseInt(idMatch[1], 10) : null;
    if (!orderId) {
        throw new Error("order_id tidak valid");
    }

    // Mapping status dari Midtrans ke status internal
    // Default status
    let internalStatus;

    if (transaction_status === "capture") {
        if (payment_type === "credit_card") {
            internalStatus = fraud_status === "challenge" ? "DENY" : "SUCCESS";
        } else {
            internalStatus = "SUCCESS";
        }
    } else if (transaction_status === "settlement") {
        internalStatus = "SUCCESS";
    } else if (transaction_status === "pending") {
        internalStatus = "PENDING";
    } else if (transaction_status === "deny") {
        internalStatus = "DENY";
    } else if (transaction_status === "cancel") {
        internalStatus = "CANCEL";
    } else if (transaction_status === "expire") {
        internalStatus = "EXPIRE";
    } else {
        internalStatus = "PENDING"; // fallback default
    }

    // Update status di database
    await updateOrderPaymentStatus(orderId, {
        payment_status: internalStatus.toUpperCase(),
        payment_method: payment_type,
    });
};


const updateStatus = async (orderId, newStatus, user, reason) => {
    const order = await findOrdersById(orderId);
    if (!order) {
        throw new ApiError(404, "Pesanan tidak ditemukan!");
    }

    const isAdmin = user.admin;

    // Validasi role dan perubahan status
    if (isAdmin) {
        if (
            ![
                OrderStatus.SHIPPED,
                OrderStatus.DELIVERED,
                OrderStatus.CANCELED,
            ].includes(newStatus)
        ) {
            throw new Error(
                "Admin hanya bisa mengubah status ke: SHIPPED, DELIVERED, atau CANCELED"
            );
        }
    } else {
        // Customer validasi hak milik order
        if (order.user_id !== user.id)
            throw new Error("Akses ditolak: bukan pesanan Anda");

        // hanya bisa batalkan dari pending
        if (
            newStatus === OrderStatus.CANCELED &&
            order.status !== OrderStatus.PENDING
        ) {
            throw new Error(
                "Pesanan hanya bisa dibatalkan saat status PENDING"
            );
        }

        // hanya bisa tandai selesai dari SHIPPED
        if (
            newStatus === OrderStatus.DELIVERED &&
            order.status !== OrderStatus.SHIPPED
        ) {
            throw new Error(
                "Pesanan hanya bisa ditandai selesai setelah dikirim"
            );
        }

        if (
            ![OrderStatus.CANCELED, OrderStatus.DELIVERED].includes(newStatus)
        ) {
            throw new Error(
                "Customer tidak berhak mengubah ke status tersebut"
            );
        }
    }
    return await updateStatusOrders(orderId, newStatus, reason);
};

const contactPartner = async (partnerId) => {
    const orders = await findOrdersByPartnerId(partnerId);

    if (!orders || orders.length === 0) {
        throw new Error("Tidak ada pesanan untuk mitra ini.");
    }

    const partner = orders[0].partner;
    return generatePartnerOrderNotification(partner, orders);
};

const updateOrders = async (id, editedOrdersData) => {
    const existingOrders = await findOrdersById(id);
    if (!existingOrders) {
        throw new ApiError(404, "Order tidak ditemukan!");
    }

    const ordersData = await updateItemOrders(id, editedOrdersData);

    return ordersData;
};

const removeOrders = async (id) => {
    const existingOrders = await findOrdersById(id);

    if (!existingOrders) {
        throw new ApiError(404, "Order tidak ditemukan!");
    }
    const ordersData = await deleteOrders(id);

    if (!ordersData) {
        throw new ApiError(500, "Gagal menghapus order!");
    }
    return ordersData;
};

module.exports = {
    getAllOrders,
    getOrdersByUser,
    getCompleteOrderByRole,
    createOrders,
    handleMidtransNotification,
    updateStatus,
    contactPartner,
    updateOrders,
    removeOrders,
};
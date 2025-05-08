const ApiError = require("../utils/apiError");
const { generatePartnerOrderNotification } = require("../utils/whatsapp");
const { OrderStatus } = require("@prisma/client");
const { getProductsByIds } = require("../product/product.repository");

const {
    findAllOrders,
    findOrdersByUser,
    findOrdersById,
    findAllComplietedOrders,
    findUserComplietedOrders,
    findOrdersByPartnerId,
    insertNewOrders,
    updateStatusOrders,
    updateOrders,
    deleteOrders,
} = require("./orders.repository");

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
    const { partner_id, items, address, paymentMethod } = orderData;

    if (!items || items.length === 0)
        throw new Error("Pesanan tidak boleh kosong");
    if (!address || !paymentMethod)
        throw new Error("Alamat dan metode pembayaran wajib diisi");

    // Ambil semua produk dari DB
    const productIds = items.map((item) => item.products_id);
    const products = await getProductsByIds(productIds);

    if (products.length !== items.length) {
        throw new Error("Beberapa produk tidak ditemukan di database");
    }

    // Hitung price per item & totalAmount
    let totalAmount = 0;
    const itemsWithPrice = items.map((item) => {
        const product = products.find((p) => p.id === item.products_id);
        if (!product)
            throw new Error(
                `Produk dengan ID ${item.products_id} tidak ditemukan`
            );
        const price = product.price * item.quantity;
        totalAmount += price;

        return {
            products_id: item.products_id,
            quantity: item.quantity,
            price,
            custom_note: item.custom_note || null,
        };
    });

    return await insertNewOrders(userId, {
        partner_id: parseInt(partner_id, 10),
        items: itemsWithPrice,
        address,
        paymentMethod,
        totalAmount: parseInt(totalAmount, 10),
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

    const ordersData = await updateOrders(id, editedOrdersData);

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
    updateStatus,
    contactPartner,
    updateOrders,
    removeOrders,
};

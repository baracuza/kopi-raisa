const ApiError = require("../utils/apiError");
const { generatePartnerOrderNotification } = require("../utils/whatsapp");
const { OrderStatus } = require("@prisma/client");
const { PaymentMethod } = require("@prisma/client")
const { getProductsByIds } = require("../product/product.repository");
const { createMidtransSnapToken } = require("../utils/midtrans");
const { deleteCartItems } = require("../cart/cart.repository");
const rajaOngkirApi = require("../utils/rajaOngkir");
const qs = require('qs');

const {

    findAllOrders,
    findAllMyNotifikasi,
    findOrdersByUser,
    findOrdersById,
    findAllComplietedOrders,
    findUserComplietedOrders,
    findOrdersByPartnerId,
    findOrderDetailById,
    getProductsByCartItem,
    // getDetailNotifikasiId,
    insertNewOrders,
    markOrderItemsAsNotified,
    updatePaymentSnapToken,
    updateOrderPaymentStatus,
    updateStatusOrders,
    updateItemOrders,
    deleteOrders,
    deleteProductCartItems,
    createOrderCancellation,
    createNotification,
    cancelOrderAndRestoreStock,
    markNotificationAsViewed
} = require("./order.repository");
const { product, user } = require("../db");

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

const getOrderHistoryByRole = async (userId, role, statusFilter) => {
    if (role === "admin") {
        return await findAllOrders(statusFilter);
    } else {
        return await findOrdersByUser(userId, statusFilter);
    }
};


const getCompleteOrderByRole = async (userId, role) => {
    if (role === "admin") {
        return await findAllComplietedOrders();
    } else {
        return await findUserComplietedOrders(userId);
    }
};


const createOrders = async (userId, orderData) => {
    console.log("Membuat order untuk user:", userId);
    console.log("Data order:", orderData);

    const {
        items,
        address,
        destination_id,
        destination_province,
        destination_city,
        destination_district,
        destination_subdistrict,
        destination_pos_code,
        paymentMethod,
        shipping_name,
        shipping_code,
        shipping_service,
        cost
    } = orderData;
    console.log("Items:", items);

    const parsedCost = parseInt(cost);
    if (isNaN(parsedCost)) {
        throw new ApiError(400, "Biaya pengiriman (cost) tidak valid!");
    }

    const parsedPosCode = parseInt(destination_pos_code);
    if (isNaN(parsedPosCode)) {
        throw new ApiError(400, "Kode pos tujuan (destination_pos_code) tidak valid!");
    }

    const parsedDestinationId = parseInt(destination_id);
    if (isNaN(parsedDestinationId)) {
        throw new ApiError(400, "ID tujuan (destination_id) tidak valid!");
    }

    if (!items || items.length === 0) {
        throw new ApiError(404, "Pesanan tidak boleh kosong");
    }
    if (!address || !paymentMethod) {
        throw new ApiError(404, "Alamat dan metode pembayaran wajib diisi");
    }

    const productIds = items.map((item) => item.products_id);
    // Log detail tipe data setiap productId
    productIds.forEach((id, index) => {
        console.log(`Tipe data productId di index ${index}:`, id, "-", typeof id);
    });

    const products = await getProductsByIds(productIds);
    console.log("Products_id yang ditemukan:", products);

    if (products.length !== items.length) {
        throw new ApiError(404, "Beberapa produk tidak ditemukan di database");
    }

    const productMap = Object.fromEntries(
        products.map(product => [product.id, product])
    );

    let totalProductPrice = 0;
    const itemsWithPrice = items.map((item) => {
        const product = productMap[item.products_id];
        if (!product) {
            throw new ApiError(404, `Produk dengan ID ${item.products_id} tidak ditemukan`);

        }
        if (!product.partner?.id) {
            throw new ApiError(400, `Produk ID ${product.id} belum memiliki partner!`);
        }

        const availableStock = product.inventory?.stock ?? 0;
        if (item.quantity > availableStock) {
            throw new ApiError(400, `Stok produk "${product.name}" tidak mencukupi. Tersedia: ${availableStock}, diminta: ${item.quantity}`);
        }

        // Hitung harga per unit
        const pricePerUnit = product.price;
        totalProductPrice += item.quantity * pricePerUnit;

        return {
            products_id: item.products_id,
            quantity: item.quantity,
            price: pricePerUnit,
            custom_note: item.custom_note || null,
            partner_id: product.partner?.id ?? null,
            fromCart: item.fromCart === true,
        };
    });

    const totalAmount = totalProductPrice + parsedCost;

    const fromCartProductId = itemsWithPrice
        .filter(item => item.fromCart)
        .map(item => item.products_id);

    // Hapus field fromCart
    const itemsToSave = itemsWithPrice.map(({ fromCart, ...rest }) => rest);

    const orders = await insertNewOrders(userId, {
        items: itemsToSave,
        address,
        destination_id: parsedDestinationId,
        destination_province,
        destination_city,
        destination_district,
        destination_subdistrict,
        parsedPosCode,
        paymentMethod,
        totalAmount,
        shipping_name,
        shipping_code,
        shipping_service,
        parsedCost,
    }, async (order) => {
        return await createMidtransSnapToken(order);
    });

    if (!orders) {
        throw new ApiError(500, "Gagal membuat order!")
    };

    let paymentInfo;
    if (orders.payment.method === "COD") {
        paymentInfo = {
            type: "cod",
            snapToken: null,
            snapRedirectUrl: null,
        }
    } else {
        const midtransResult = orders.midtransResult;
        let snapToken = null;
        let snapRedirectUrl = null;

        if (midtransResult) {
            if (orders.payment.method === "QRIS") {
                snapRedirectUrl = midtransResult.qrUrl;
            } else {
                snapToken = midtransResult.snapToken;
                snapRedirectUrl = midtransResult.snapRedirectUrl;
            }
        }
        paymentInfo = {
            type: orders.payment.method === "QRIS" ? "qris" : "snap",
            snapToken,
            snapRedirectUrl,
        }
    }

    // Hapus produk dari cart jika perlu
    if (fromCartProductId.length > 0) {
        await deleteProductCartItems(userId, fromCartProductId);
    }

    return {
        updatedOrder: orders,
        paymentInfo,
    };
};

const handleMidtransNotification = async (notification) => {
    const {
        transaction_status,
        payment_type,
        order_id,
        fraud_status,
    } = notification;

    console.log("📥 Midtrans Notification:", notification);
    if (!transaction_status || !payment_type || !order_id) {
        throw new ApiError(400, "Data tidak lengkap dari Midtrans");
    }

    // Validasi & parsing order_id
    const idMatch = order_id?.match(/ORDER-(\d+)-/);
    const orderId = idMatch ? parseInt(idMatch[1], 10) : null;

    if (!orderId) {
        throw new Error(`order_id tidak valid: ${order_id}`);
    }

    // Mapping status Midtrans → status internal
    const internalStatus = mapTransactionStatus(transaction_status, payment_type, fraud_status);
    const paymentMethod = mapPaymentMethod(payment_type);

    if (!paymentMethod) {
        throw new Error(`Payment method '${payment_type}' tidak dikenali`);
    }

    console.log("✅ Parsed Order ID:", orderId);
    console.log("🔁 Mapped Status:", internalStatus);
    console.log("💳 Mapped Payment Method:", paymentMethod);

    // Update status pembayaran di database
    const { order, updatedPayment } = await updateOrderPaymentStatus(orderId, {
        payment_status: internalStatus,
        payment_method: paymentMethod,
    });

    if (internalStatus === 'SUCCESS') {
        try {
            // Panggil service notifikasi yang baru kita buat
            await createNotificationForPaymentSuccess(order, updatedPayment);
        } catch (notificationError) {
            // Kegagalan membuat notifikasi tidak boleh menghentikan proses utama
            console.error(
                "⚠️ Gagal membuat notifikasi pembayaran untuk order:",
                orderId,
                notificationError
            );
        }
    }

    return updatedPayment;

};

// Helper untuk mapping status transaksi
const mapTransactionStatus = (status, type, fraud) => {
    switch (status) {
        case "capture":
            return type === "credit_card"
                ? (fraud === "challenge" ? "DENY" : "SUCCESS")
                : "SUCCESS";
        case "settlement":
            return "SUCCESS";
        case "pending":
            return "PENDING";
        case "deny":
            return "DENY";
        case "cancel":
            return "CANCEL";
        case "expire":
            return "EXPIRE";
        default:
            return "PENDING";
    }
};

// Helper untuk mapping payment_type Midtrans → enum PaymentMethod di Prisma
const mapPaymentMethod = (type) => {
    const mapping = {
        bank_transfer: "BANK_TRANSFER",
        credit_card: "CREDIT_CARD",
        qris: "QRIS",
    };
    return mapping[type] || null;
};


const getOrderDetailById = async (orderId, isAdmin, userId) => {
    if (isAdmin === true) {
        const order = await findOrderDetailById(orderId);
        if (!order) {
            throw new ApiError(404, "Order tidak ditemukan");
        }
        return {
            orderId: order.id,
            namaCustomer: order.user?.name || "-",
            nomerCustomer: order.user?.phone_number || "-",
            alamatCustomer: order.shippingAddress?.address || "-",
            provinsiCustomer: order.shippingAddress?.destination_province || "-",
            kotaCustomer: order.shippingAddress?.destination_city || "-",
            kodePos: order.shippingAddress?.destination_zip_code || "-",
            tanggalTransaksi: order.created_at,
            statusOrder: order.status,
            items: order.orderItems.map(item => ({
                namaProduk: item.product.name,
                gambarProduk: item.product.image,
                harga: item.price,
                quantity: item.quantity,
                catatan: item.custom_note,
                namaMitra: item.partner?.name || "-",
            })),
            metodePembayaran: order.payment?.method || "-",
            statusPembayaran: order.payment?.status || "-",
            totalHarga: order.payment?.amount ?? 0,
        };
    } else {
        const order = await findOrderDetailById(orderId);
        if (!order || order.user_id !== userId) {
            throw new ApiError(403, "Anda tidak memiliki akses ke order ini");
        }
        return {
            orderId: order.id,
            namaCustomer: order.user?.name || "-",
            nomerCustomer: order.user?.phone_number || "-",
            alamatCustomer: order.shippingAddress?.address || "-",
            provinsiCustomer: order.shippingAddress?.destination_province || "-",
            kotaCustomer: order.shippingAddress?.destination_city || "-",
            kodePos: order.shippingAddress?.destination_zip_code || "-",
            tanggalTransaksi: order.created_at,
            statusOrder: order.status,
            items: order.orderItems.map(item => ({
                namaProduk: item.product.name,
                gambarProduk: item.product.image,
                harga: item.price,
                quantity: item.quantity,
                catatan: item.custom_note,
                namaMitra: item.partner?.name || "-",
            })),
            metodePembayaran: order.payment?.method || "-",
            statusPembayaran: order.payment?.status || "-",
            totalHarga: order.payment?.amount ?? 0,
        };
    }
};

const getOrderStatuses = (isAdmin) => {
    if (isAdmin) {
        return Object.values(OrderStatus);
    } else {
        return Object.values(OrderStatus).filter(status => [OrderStatus.DELIVERED].includes(status));
    }
};

const getDomestic = async (searchParams) => {

    const {
        search,
        limit = 1000,
        offset = 0
    } = searchParams;

    const response = await rajaOngkirApi.get('/destination/domestic-destination', {
        params: { search, limit, offset },
    });

    const allDataDomestic = response.data.data;
    console.log("Data semua domestic service(allDataDomestic):", allDataDomestic);

    if (!allDataDomestic || allDataDomestic.length === 0) {
        throw new ApiError(404, "Tidak ada data domestik ditemukan!");
    }

    return allDataDomestic
}

const getCost = async (searchCost) => {

    const payload = {
        courier: "jnt",
        origin: "31366",
        destination: searchCost.destination,
        weight: parseInt(searchCost.weight),
        price: searchCost.price,
    }

    console.log("Payload untuk ongkos kirim:", payload);

    try {
        const response = await rajaOngkirApi.post(
            '/calculate/domestic-cost',
            qs.stringify(payload), // ← ini mengubah jadi x-www-form-urlencoded
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const responseData = response.data;
        if (!responseData || !responseData.data) {
            throw new ApiError(404, "Tidak ada data ongkos kirim ditemukan!");
        }

        return responseData;
    } catch (error) {
        console.error("Error dari getCost():", error?.response?.data || error.message);
        throw error;
    }

}

const getPaymentMethod = () => {
    return Object.values(PaymentMethod);
};

//tidak digunakan//
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
                OrderStatus.PROCESSING,
                OrderStatus.SHIPPED,
                OrderStatus.DELIVERED,
                OrderStatus.CANCELED,
            ].includes(newStatus)
        ) {
            throw new Error(
                "Admin hanya bisa mengubah status ke: PROCESSING, SHIPPED, DELIVERED, atau CANCELED"
            );
        }
    } else {
        // Customer validasi hak milik order
        if (order.user_id !== user.id)
            throw new Error("Akses ditolak: bukan pesanan Anda");

        // hanya bisa batalkan dari pending
        if (
            newStatus === OrderStatus.CANCELED
        ) {
            throw new ApiError(
                403, "Customer tidak diizinkan membatalkan pesanan tanpa alasan"
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
//tidak digunakan//

const updatedOrderStatus = async (orderId, newStatus, user) => {
    const order = await findOrdersById(orderId);
    if (!order) {
        throw new ApiError(404, "Pesanan tidak ditemukan!");
    }

    const isAdmin = user.admin;

    // Hanya admin yang bisa mengubah status 
    if (isAdmin) {
        if (
            ![
                OrderStatus.PROCESSING,
                OrderStatus.SHIPPED,
                OrderStatus.DELIVERED,
                OrderStatus.CANCELED,
            ].includes(newStatus)
        ) {
            throw new ApiError(
                403, "Admin hanya bisa mengubah status ke: PROCESSING, SHIPPED, DELIVERED, atau CANCELED"
            );
        }
    } else {
        // Customer validasi hak milik order
        if (order.user_id !== user.id)
            throw new ApiError(403, "Akses ditolak: bukan pesanan Anda");

        // hanya bisa batalkan dari pending
        if (
            newStatus === OrderStatus.CANCELED
        ) {
            throw new ApiError(
                403, "Customer tidak diizinkan membatalkan pesanan tanpa alasan"
            );
        }

        // hanya bisa tandai selesai dari SHIPPED
        if (
            newStatus === OrderStatus.DELIVERED &&
            order.status !== OrderStatus.SHIPPED
        ) {
            throw new ApiError(
                403, "Pesanan hanya bisa ditandai selesai setelah dikirim"
            );
        }

        if (
            ![OrderStatus.DELIVERED].includes(newStatus)
        ) {
            throw new ApiError(
                403, "Customer tidak berhak mengubah ke status tersebut"
            );
        }
    }

    return await updateStatusOrders(orderId, newStatus);
}

const cancelOrder = async (orderId, user, reason) => {
    const order = await findOrdersById(orderId);
    if (!order) {
        throw new ApiError(404, "Pesanan tidak ditemukan.");
    }

    // Hanya pemilik pesanan yang bisa membatalkan
    if (order.user_id !== user.id) {
        throw new ApiError(403, "Akses ditolak: bukan pesanan Anda.");
    }

    // Hanya bisa dibatalkan jika masih PENDING
    if (order.status !== OrderStatus.PENDING) {
        throw new ApiError(400, "Pesanan hanya bisa dibatalkan saat status masih PENDING.");
    }

    const updatedOrder = await cancelOrderAndRestoreStock(order, user.id, reason);
    if (!updatedOrder) {
        throw new ApiError(500, "Gagal membatalkan pesanan dan mengembalikan stok.");
    }

    // const updatedOrder = await updateStatusOrders(orderId, OrderStatus.CANCELED);
    // if (!updatedOrder) {
    //     throw new ApiError(500, "Gagal membatalkan pesanan.");
    // }

    // // Simpan alasan resmi pembatalan
    // await createOrderCancellation(orderId, user.id, reason);

    try {
        // Panggil service notifikasi yang baru
        await createNotificationForOrderCancellation(order, reason);
    } catch (notificationError) {
        console.error(
            "⚠️ Gagal membuat notifikasi pembatalan untuk order:",
            orderId,
            notificationError
        );
    }

    return updatedOrder;
};


const contactPartner = async (partnerId) => {
    if (!partnerId || isNaN(partnerId)) {
        throw new ApiError(400, "ID mitra tidak valid.");
    }

    console.log("Mencari order dengan ID:", partnerId);
    const orderItems = await findOrdersByPartnerId(partnerId);
    console.log("Order ditemukan:", orderItems);

    if (!orderItems || orderItems.length === 0) {
        throw new ApiError(404, "Tidak ada pesanan baru untuk mitra ini.");
    }

    const partner = orderItems[0].partner;
    if (!partner.phone_number || !/^\+?(\d{10,15})$/.test(partner.phone_number)) {
        throw new ApiError(400, "Nomor telepon mitra tidak tersedia atau tidak valid.");
    }

    // Kelompokkan order berdasarkan ID
    const groupedOrders = {};

    orderItems.forEach((item) => {
        const orderId = item.order.id;
        if (!groupedOrders[orderId]) {
            groupedOrders[orderId] = {
                user: item.order.user,
                status: item.order.status,
                items: [],
            };
        }
        groupedOrders[orderId].items.push(item);
    });

    const orders = Object.entries(groupedOrders).map(([orderId, data]) => ({
        id: Number(orderId),
        user: data.user,
        status: data.status,
        orderItems: data.items,
    }));

    const result = generatePartnerOrderNotification(partner, orders);
    if (!result || !result.message) {
        throw new ApiError(500, "Gagal membuat pesan notifikasi untuk mitra.");
    }
    const itemIds = orderItems.map((i) => i.id);
    await markOrderItemsAsNotified(itemIds);

    return result;
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

const createNotificationForNewOrder = async (userId, order) => {
    // Menghitung jumlah item dalam pesanan
    const itemCount = order.orderItems.length;

    // Mengambil total pembayaran dari objek pesanan
    const totalAmount = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(order.payment.amount);

    // Membuat pesan yang deskriptif
    const notificationName = `Pesanan #${order.id} Berhasil Dibuat`;
    const notificationDescription = `Pesanan Anda berisi ${itemCount} produk dengan total ${totalAmount} telah dibuat dan sedang menunggu pembayaran.`;

    // Data yang akan disimpan ke database
    const notificationData = {
        name: notificationName,
        description: notificationDescription,
        user_id: userId,
        order_id: order.id,
    };

    await createNotification(notificationData);
};

const createNotificationForPaymentSuccess = async (order, payment) => {
    // Format jumlah pembayaran agar mudah dibaca
    const formattedAmount = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(payment.amount);

    // Siapkan data notifikasi yang deskriptif
    const notificationData = {
        name: `Pembayaran untuk Pesanan #${order.id} Berhasil`,
        description: `Pembayaran Anda sebesar ${formattedAmount} telah kami konfirmasi.`,
        user_id: order.user_id, // Kita butuh user_id dari objek order
        order_id: order.id,
    };

    // Panggil repository untuk menyimpan notifikasi
    await createNotification(notificationData);
    console.log(`✅ Notifikasi pembayaran berhasil dibuat untuk order ID: ${order.id}`);
};

const createNotificationForOrderCancellation = async (order, reason) => {
    const notificationData = {
        name: `Pesanan #${order.id} Telah Dibatalkan`,
        description: `Pesanan Anda telah dibatalkan dengan alasan: "${reason}". Jika ini adalah kesalahan, silakan buat pesanan baru.`,
        user_id: order.user_id,
        order_id: order.id,
    };

    await createNotification(notificationData);
    console.log(`✅ Notifikasi pembatalan berhasil dibuat untuk order ID: ${order.id}`);
};

const readNotification = async (ref, userId) => {
    if (!ref) return;
    await markNotificationAsViewed(ref, userId);
};

const getMyNotifikasi = async (userId) => {
    const myNotifikasi = await findAllMyNotifikasi(userId);
    if (!myNotifikasi || myNotifikasi.length === 0) {
        throw new ApiError(404, "Tidak ada notifikasi ditemukan!");
    }

    return myNotifikasi
}

// const getDetailNotifikasi = async (notifikasiId, userId) => {
//     const notifikasiService = await getDetailNotifikasiId(notifikasiId, userId);
//     if (!notifikasiService || notifikasiService.length === 0) {
//         throw new ApiError(404, "Notifikasi tidak ditemukan!");
//     }

//     return notifikasiService;
// }



module.exports = {
    getDomestic,
    getAllOrders,
    getOrdersByUser,
    getMyNotifikasi,
    getCompleteOrderByRole,
    getCost,
    getOrderDetailById,
    getOrderStatuses,
    getOrderHistoryByRole,
    getPaymentMethod,
    // getDetailNotifikasi,
    createOrders,
    contactPartner,
    cancelOrder,
    createNotificationForNewOrder,
    createNotificationForOrderCancellation,
    createNotificationForPaymentSuccess,
    handleMidtransNotification,
    updateStatus,
    updateOrders,
    updatedOrderStatus,
    removeOrders,
    readNotification,
};
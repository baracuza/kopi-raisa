const express = require("express");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { authMiddleware } = require("../middleware/middleware");
const ApiError = require("../utils/apiError");
const { validationResult } = require("express-validator");
const { orderValidator, validateQueryDomestic, validateCost } = require("../validation/validation");
const handleValidationResult = require('../middleware/handleValidationResult');
const handleValidationResultFinal = require('../middleware/handleValidationResultFinal');
const verifyMidtransSignature = require("../middleware/midtransSignatureValidator");
const upload = require("../middleware/multer");


const {
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
    getDetailNotifikasi,
    createOrders,
    createNotificationForNewOrder,
    handleMidtransNotification,
    updateOrders,
    updateStatus,
    updatedOrderStatus,
    readNotification,
    contactPartner,
    cancelOrder
} = require("./order.service");
const { order } = require("../db");

const router = express.Router();

// Get all orders-admin
router.get("/", authMiddleware, async (req, res) => {
    if (!req.user.admin) {
        return res.status(403).json({
            message: "Akses ditolak! Hanya admin yang bisa mengakses.",
        });
    }
    try {
        const orders = await getAllOrders();
        res.status(200).json({
            message: "Data order berhasil didapatkan!",
            data: orders,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error("ApiError:", error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error("Error getting orders:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan di server!",
            error: error.message,
        });
    }
});

// Get order detail user-admin
router.get("/:id/detail", authMiddleware, async (req, res) => {
    try {
        const isAdmin = req.user.admin;
        const userId = req.user.id;
        const { id } = req.params;
        const { ref } = req.query;

        if (ref) {
            try {
                // Panggil service untuk mengubah status 'viewed' menjadi true
                await readNotification(ref, userId);
            } catch (notifError) {
                // Jika gagal, jangan hentikan proses. Cukup catat errornya.
                console.error("Gagal menandai notifikasi sebagai dibaca:", notifError);
            }
        }

        const order = await getOrderDetailById(id, isAdmin, userId);
        res.status(200).json({
            message: "Data order berhasil didapatkan!",
            data: order,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error("ApiError:", error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error("Error getting orders:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan di server!",
            error: error.message,
        });
    }
});

// Get orders by user
router.get("/my-order", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        const allowedStatuses = ["diproses", "selesai"];
        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Status tidak valid. Gunakan 'diproses' atau 'selesai'.",
            });
        }

        const orders = await getOrdersByUser(userId, status);

        const formattedOrders = orders.map((order) => ({
            orderId: order.id,
            statusOrder: order.status,
            createdAt: order.created_at,
            items: order.orderItems.map((item) => ({
                productId: item.product.id,
                productImage: item.product.image,
                name: item.product.name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.quantity * item.price,
                partner: {
                    id: item.partner?.id,
                    name: item.partner?.name || "Mitra"
                },
                note: item.custom_note || "-",
            })),
            shippingAddress: order.shippingAddress?.address || "-",
            payment: {
                method: order.payment?.method,
                statusPembayaran: order.payment?.status,
                amount: order.payment?.amount,
                Snap: order.payment?.snap_token || null,
                snapRedirectUrl: order.payment?.snap_redirect_url || null,
            }
        }));

        res.status(200).json({
            message: "Data order berhasil didapatkan!",
            orders: formattedOrders,
        });

    } catch (error) {
        if (error instanceof ApiError) {
            console.error("ApiError:", error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error("Error getting orders:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan di server!",
            error: error.message,
        });
    }
});

//history order untuk admin dan user bisa filter status order
router.get("/history", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.admin;

        // Dapatkan parameter status dari query, bisa string atau array
        let { status } = req.query;

        // Normalize jadi array (bisa string tunggal atau array)
        if (status && !Array.isArray(status)) {
            status = [status];
        }

        const orders = await getOrderHistoryByRole(userId, role, status);

        res.status(200).json({
            message: "Riwayat pesanan berhasil diambil!",
            data: orders,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan di server!" });
    }
});

//(opsional)
router.get("/completed", authMiddleware, async (req, res) => {
    try {
        const sold = await getCompleteOrderByRole();
        res.status(200).json({
            message: "Data order berhasil didapatkan!",
            data: sold,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error("ApiError:", error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error("Error getting orders:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan di server!",
            error: error.message,
        });
    }
});

// status untuk order
router.get("/Order-statuses", authMiddleware, (req, res) => {
    try {
        const isAdmin = req.user.admin;
        const statuses = getOrderStatuses(isAdmin);
        res.status(200).json({
            message: "Daftar status order berhasil diambil",
            data: statuses,
        });
    } catch (error) {
        console.error("Error getting order statuses:", error);
        res.status(500).json({
            message: "Terjadi kesalahan saat mengambil status order",
            error: error.message,
        });
    }
});

router.get("/payment-method", authMiddleware, (req, res) => {
    try {
        const statuses = getPaymentMethod();
        res.status(200).json({
            message: "Daftar status order berhasil diambil",
            data: statuses,
        });
    } catch (error) {
        console.error("Error getting order statuses:", error);
        res.status(500).json({
            message: "Terjadi kesalahan saat mengambil status order",
            error: error.message,
        });
    }
});

// Create new order-user
router.post("/", authMiddleware, orderValidator, handleValidationResult, handleValidationResultFinal,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorObject = errors.array().reduce((acc, curr) => {
                const key = curr.path && curr.path !== "" ? curr.path : "global";
                if (!acc[key]) {
                    acc[key] = curr.msg;
                }
                return acc;
            }, {});

            return res.status(400).json({
                message: "Validasi gagal!",
                errors: errorObject,
            });
        }

        try {
            const userId = req.user.id;
            const orderData = req.body;
            console.log("📦 Received order data:", orderData);
            console.log("🧪 Type Checking:");
            console.log("- typeof orderData:", typeof orderData);

            if (Array.isArray(orderData.items)) {
                orderData.items.forEach((item, index) => {
                    console.log(`  🧾 Item[${index}] - products_id:`, item.products_id, "| typeof:", typeof item.products_id);
                });
            }

            const { paymentInfo, updatedOrder } = await createOrders(userId, orderData);
            console.log("Order created successfully:", updatedOrder);

            try {
                await createNotificationForNewOrder(userId, updatedOrder);
            } catch (notificationError) {
                // Jika pembuatan notifikasi gagal, jangan gagalkan seluruh request.
                // Cukup catat errornya agar bisa ditinjau nanti.
                console.error("⚠️ Failed to create notification for order:", updatedOrder.id, notificationError);
            }

            res.status(201).json({
                message: "Pesanan kamu berhasil dibuat dan sedang diproses.",
                // data: updatedOrder,
                order: {
                    orderId: updatedOrder.id,
                    items: updatedOrder.orderItems.map(item => ({
                        productId: item.products_id,
                        name: item.product?.name || "-",
                        quantity: item.quantity,
                        price: item.price,
                        subtotal: item.quantity * item.price,
                        note: item.custom_note,
                        partner: {
                            id: item.product?.partner?.id,
                            name: item.product?.partner?.name || "Mitra"
                        }
                    })),
                    shippingAddress: updatedOrder.shippingAddress?.address || "-",
                    payment: {
                        method: updatedOrder.payment?.method,
                        status: updatedOrder.payment?.status,
                        amount: updatedOrder.payment?.amount,
                        type: paymentInfo.type,
                        ...(paymentInfo.type === "qris"
                            ? { snapRedirectUrl: paymentInfo.snapRedirectUrl }
                            : {
                                snapToken: paymentInfo.snapToken,
                                snapRedirectUrl: paymentInfo.snapRedirectUrl
                            }),
                    },
                    status: updatedOrder.status,
                    createdAt: updatedOrder.created_at,
                },
            });


        } catch (error) {
            if (error instanceof ApiError) {
                console.error("ApiError:", error);
                return res.status(error.statusCode).json({
                    message: error.message,
                });
            }

            console.error("Error creating order:", error);
            return res.status(500).json({
                message: "Terjadi kesalahan di server!",
                error: error.message,
            });
        }
    });


//notifikasi midtrans setelah transaksi
router.post("/midtrans/notification", async (req, res) => {
    try {
        const notification = req.body;
        console.log("🔔 Notifikasi Midtrans diterima:", notification)

        const notifikasi = await handleMidtransNotification(notification);

        console.log("✅ Notifikasi Midtrans berhasil diproses:", notifikasi);

        return res.status(200).json({
            message: "Notifikasi berhasil diproses",
            data: notifikasi,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error("ApiError:", error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }
        console.error("❌ Error in /midtrans/notification:");
        console.error("🧾 Error Message:", error.message);
        console.error("📦 Full Error Stack:", error.stack);
        console.error("Error in /midtrans/notification:", error);
        return res.status(500).json({ message: "Gagal memproses notifikasi", error: error.message });
    }
});

router.post("/contact-partner/:partnerId", authMiddleware, async (req, res) => {
    if (!req.user.admin) {
        return res.status(403).json({
            message: "Akses ditolak! Hanya admin yang bisa mengakses.",
        });
    }
    const { partnerId } = req.params;
    try {
        const result = await contactPartner(Number(partnerId));

        console.log("Contact Partner Result:", result);

        res.status(200).json({
            message: "Link WhatsApp berhasil dibuat.",
            data: result,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error("ApiError:", error);
            return res.status(error.statusCode).json({
                message: error.message || "Gagal menghubungi mitra.",
            });
        }

        console.error("Error sending message to partner:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan di server!",
            error: error.message,
        });
    }
});

router.get("/search-address", authMiddleware, validateQueryDomestic, handleValidationResult, handleValidationResultFinal,
    async (req, res) => {

        // Validasi query params
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorObject = errors.array().reduce((acc, curr) => {
                const key = curr.path && curr.path !== "" ? curr.path : "global";
                if (!acc[key]) {
                    acc[key] = curr.msg;
                }
                return acc;
            }, {});

            return res.status(400).json({
                message: "Validasi gagal!",
                errors: errorObject,
            });
        }

        // fungsi pencarian alamat domestik
        try {
            const searchParams = req.query
            console.log("Search Query Params (searchParams):", searchParams);

            const searchAddress = await getDomestic(searchParams)
            console.log("Search Address Result controller(searchAddress):", searchAddress);

            res.status(200).json({
                message: "Berhasil mendapatkan Tujuan Domestik.",
                data: searchAddress,
            });
        } catch (error) {
            console.error("Error getting domestic address:", error);
            if (error instanceof ApiError) {
                console.error('ApiError:', error);
                return res.status(error.statusCode).json({
                    message: error.message,
                })
            }

            // Coba ambil info error dari axios
            if (error.isAxiosError && error.response) {
                return res.status(error.response.status).json({
                    message: error.response.data?.message || error.message,
                    details: error.response.data || null,
                });
            }

            console.error("Get Domestic Error:", error);
            return res.status(error.statusCode || 500).json({
                message: error.message || "Terjadi kesalahan saat mengambil data provinsi.",
            });

        }
    })

router.post("/search-cost", authMiddleware, upload.none(), validateCost, handleValidationResult, handleValidationResultFinal,
    async (req, res) => {

        // Validasi query params
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorObject = errors.array().reduce((acc, curr) => {
                const key = curr.path && curr.path !== "" ? curr.path : "global";
                if (!acc[key]) {
                    acc[key] = curr.msg;
                }
                return acc;
            }, {});

            return res.status(400).json({
                message: "Validasi gagal!",
                errors: errorObject,
            });
        }

        // fungsi pencarian alamat domestik
        try {
            const searchCost = req.body

            const searchAddress = await getCost(searchCost)
            console.log("Search Address Result controller(searchAddress):", searchAddress);

            res.status(200).json({
                message: "Berhasil mendapatkan Tujuan Domestik.",
                data: searchAddress,
            });
        } catch (error) {
            console.error("Error getting domestic address:", error);
            if (error instanceof ApiError) {
                console.error('ApiError:', error);
                return res.status(error.statusCode).json({
                    message: error.message,
                })
            }

            // Coba ambil info error dari axios
            if (error.isAxiosError && error.response) {
                return res.status(error.response.status).json({
                    message: error.response.data?.message || error.message,
                    details: error.response.data || null,
                });
            }

            console.error("Get Domestic Error:", error);
            return res.status(error.statusCode || 500).json({
                message: error.message || "Terjadi kesalahan saat mengambil data provinsi.",
            });

        }
    }
)


// Cancel order - user
router.put("/:id/cancel", authMiddleware, async (req, res, next) => {
    try {
        const orderId = parseInt(req.params.id);
        const { reason } = req.body;
        const user = req.user;

        if (!reason || reason.trim() === "") {
            return res.status(400).json({
                message: "Alasan pembatalan harus diisi.",
            });
        }

        const result = await cancelOrder(orderId, user, reason);

        res.status(200).json({
            message: "Pesanan berhasil dibatalkan.",
            data: result,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            })
        }

        console.error("Cancel Error:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Terjadi kesalahan saat membatalkan pesanan.",
        });
    }
});

// Update order status - admin&user
router.put("/:id/update-status", authMiddleware, async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;
        const user = req.user;

        const updatedOrder = await updatedOrderStatus(orderId, status, user);
        res.status(200).json({
            message: "Status order berhasil diperbarui!",
            data: updatedOrder,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error("ApiError:", error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }
        console.error("Error updating order status:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan di server!",
            error: error.message,
        });

    }
})

router.put("/:id", authMiddleware, async (req, res) => {
    if (!req.user.admin) {
        return res.status(403).json({
            message: "Akses ditolak! Hanya admin yang bisa mengakses.",
        });
    }
    try {
        const { id } = req.params;
        const editedOrders = req.body;
        const order = await updateOrders(id, editedOrders);
        res.status(200).json({
            message: "Order berhasil diperbarui!",
            data: order,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error("ApiError:", error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }
        console.error("Error updating order:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan di server!",
            error: error.message,
        });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    if (!req.user.admin) {
        return res.status(403).json({
            message: "Akses ditolak! Hanya admin yang bisa mengakses.",
        });
    }
    try {
        const { id } = req.params;
        const order = await deleteOrders(id);
        res.status(200).json({
            message: "Order berhasil dihapus!",
            data: order,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error("ApiError:", error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }
        console.error("Error deleting order:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan di server!",
            error: error.message,
        });
    }
});

router.get("/notifications", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const notifikasi = await getMyNotifikasi(userId);

        res.status(200).json({
            message: "Notifikasi berhasil diambil!",
            data: notifikasi,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error("ApiError:", error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }
        console.error("Error getting notifications:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan di server!",
            error: error.message,
        });

    }
})

// router.get("/notifications/:id", authMiddleware, async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const { id } = req.params;

//         const detailNotifikasi = await getDetailNotifikasi(id, userId);

//         res.status(200).json({
//             message: "Notifikasi berhasil diambil!",
//             data: detailNotifikasi,
//         });
//     } catch (error) {
//         if (error instanceof ApiError) {
//             console.error("ApiError:", error);
//             return res.status(error.statusCode).json({
//                 message: error.message,
//             });
//         }
//         console.error("Error getting notification detail:", error);
//         return res.status(500).json({
//             message: "Terjadi kesalahan di server!",
//             error: error.message,
//         });
//     }
// })

module.exports = router;
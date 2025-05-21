const express = require("express");

const { authMiddleware } = require("../middleware/middleware");
const ApiError = require("../utils/apiError");
const { validationResult } = require("express-validator");
const { orderValidator } = require("../validation/validation");
const handleValidationResult = require('../middleware/handleValidationResult');
const handleValidationResultFinal = require('../middleware/handleValidationResultFinal');
const verifyMidtransSignature = require("../middleware/midtransSignatureValidator");


const {
    getAllOrders,
    getOrdersByUser,
    getCompleteOrderByRole,
    createOrders,
    handleMidtransNotification,
    updateOrders,
    updateStatus,
    contactPartner,
} = require("./order.service");

const router = express.Router();

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
            items: order.orderItems.map((item) => ({
                productId: item.product.id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.quantity * item.price,
                partner: {
                    id: order.partner?.id,
                    name: order.partner?.name || "Mitra"
                }
            })),
            shippingAddress: order.shippingAddress?.address || "-",
            payment: {
                method: order.payment?.method,
                status: order.payment?.status,
                amount: order.payment?.amount,
            },
            status: order.status,
            createdAt: order.created_at,
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


router.get("/completed", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role; // Assuming you have the user's role in the token

        const orders = await getCompleteOrderByRole(userId, role);
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
            const { updatedOrder, paymentInfo } = await createOrders(userId, orderData);

            res.status(201).json({
                message: "Pesanan kamu berhasil dibuat dan sedang diproses.",
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
                            ? { qrUrl: paymentInfo.snapRedirectUrl }
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

router.post("/midtrans/notification", async (req, res) => {
    try {
        await handleMidtransNotification(req.body);
        return res.status(200).json({ message: "Notifikasi berhasil diproses" });
    } catch (error) {
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

router.put("/:id/status", authMiddleware, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorObject = errors.array().reduce(
            (acc, curr) => {
                const key =
                    curr.path && curr.path !== "" ? curr.path : "global";
                if (!acc[key]) {
                    acc[key] = curr.msg;
                }
                return acc;
            },
            {},
            {}
        );
        return res.status(400).json({
            message: "Validasi gagal!",
            errors: errorObject,
        });
    }
    try {
        console.log(req.body);
        const orderId = parseInt(req.params.id);
        const { status, reason } = req.body;
        const user = req.user;

        const result = await updateStatus(orderId, status, user, reason);

        res.status(200).json({
            message: "Status order berhasil diperbarui!",
            data: result,
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
});

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

module.exports = router;
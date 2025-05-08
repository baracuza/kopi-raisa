const express = require("express");
// const prisma = require("../db");

const {
    getAllOrders,
    getOrdersByUser,
    getCompleteOrderByRole,
    createOrders,
    updateStatus,
    contactPartner,
} = require("./orders.service");

const { authMiddleware } = require("../middleware/middleware");
const ApiError = require("../utils/apiError");
const { validationResult } = require("express-validator");
const { orderValidator } = require("../validation/validation");
const { parse } = require("dotenv");

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
        // ambil id user dari token yang sudah di verifikasi
        // console.log("User ID:", req.user.id); // <-- ini penting
        // console.log("token:", req.cookies.token); // <-- ini penting
        const userId = req.user.id;
        const { status } = req.query;
        const orders = await getOrdersByUser(userId, status);
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

router.post("/", authMiddleware, orderValidator, async (req, res) => {
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
        const orders = await createOrders(userId, orderData);

        res.status(201).json({
            message: "Order berhasil dibuat!",
            data: orders,
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

// router.get("/:id", /complete-order", authMiddleware, async (req, res) => {
// })thMiddleware, async (req, res) => {
//     try {
//         const { id } = req.params;
//         const order = await getOrdersById(id);
//         res.status(200).json({
//             message: "Data order berhasil didapatkan!",
//             data: order,
//         });
//     } catch (error) {
//         if (error instanceof ApiError) {
//             console.error("ApiError:", error);
//             return res.status(error.statusCode).json({
//                 message: error.message,
//             });
//         }

//         console.error("Error getting order:", error);
//         return res.status(500).json({
//             message: "Terjadi kesalahan di server!",
//             error: error.message,
//         });
//     }
// });

// router.get("/partner/:partnerId", authMiddleware, async (req, res) => {
//     try {
//         const { partnerId } = req.params;
//         const orders = await getOrdersByPartnerId(partnerId);
//         res.status(200).json({
//             message: "Data order berhasil didapatkan!",
//             data: orders,
//         });
//     } catch (error) {
//         if (error instanceof ApiError) {
//             console.error("ApiError:", error);
//             return res.status(error.statusCode).json({
//                 message: error.message,
//             });
//         }

//         console.error("Error getting order:", error);
//         return res.status(500).json({
//             message: "Terjadi kesalahan di server!",
//             error: error.message,
//         });
//     }
// });

// router.get("/user/:userId", authMiddleware, async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const orders = await getOrdersByUserId(userId);
//         res.status(200).json({
//             message: "Data order berhasil didapatkan!",
//             data: orders,
//         });
//     } catch (error) {
//         if (error instanceof ApiError) {
//             console.error("ApiError:", error);
//             return res.status(error.statusCode).json({
//                 message: error.message,
//             });
//         }

//         console.error("Error getting order:", error);
//         return res.status(500).json({
//             message: "Terjadi kesalahan di server!",
//             error: error.message,
//         });
//     }
// });

// router.get("/status/:status", authMiddleware, async (req, res) => {
//     try {
//         const { status } = req.params;
//         const orders = await getOrdersByStatus(status);
//         res.status(200).json({
//             message: "Data order berhasil didapatkan!",
//             data: orders,
//         });
//     } catch (error) {
//         if (error instanceof ApiError) {
//             console.error("ApiError:", error);
//             return res.status(error.statusCode).json({
//                 message: error.message,
//             });
//         }

//         console.error("Error getting order:", error);
//         return res.status(500).json({
//             message: "Terjadi kesalahan di server!",
//             error: error.message,
//         });
//     }
// });

// router.post("/", authMiddleware, async (req, res) => {
//     try {
//         const newOrders = req.body;
//         const orders = await createOrders(newOrders);

//         res.status(201).json({
//             message: "Order berhasil dibuat!",
//             data: orders,
//         });
//     } catch (error) {
//         if (error instanceof ApiError) {
//             console.error("ApiError:", error);
//             return res.status(error.statusCode).json({
//                 message: error.message,
//             });
//         }

//         console.error("Error creating order:", error);
//         return res.status(500).json({
//             message: "Terjadi kesalahan di server!",
//             error: error.message,
//         });
//     }
// });

// router.put("/:id", authMiddleware, async (req, res) => {
//     try {
//         const { id } = req.params;
//         const editedOrders = req.body;

//         const order = await updateOrders(id, editedOrders);

//         res.status(200).json({
//             message: "Order berhasil diperbarui!",
//             data: order,
//         });
//     } catch (error) {
//         if (error instanceof ApiError) {
//             console.error("ApiError:", error);
//             return res.status(error.statusCode).json({
//                 message: error.message,
//             });
//         }

//         console.error("Error updating order:", error);
//         return res.status(500).json({
//             message: "Terjadi kesalahan di server!",
//             error: error.message,
//         });
//     }
// });

// router.delete("/:id", authMiddleware, async (req, res) => {
//     try {
//         const { id } = req.params;
//         const order = await removeOrders(id);

//         res.status(200).json({
//             message: "Order berhasil dihapus!",
//             data: order,
//         });
//     } catch (error) {
//         if (error instanceof ApiError) {
//             console.error("ApiError:", error);
//             return res.status(error.statusCode).json({
//                 message: error.message,
//             });
//         }

//         console.error("Error deleting order:", error);
//         return res.status(500).json({
//             message: "Terjadi kesalahan di server!",
//             error: error.message,
//         });
//     }
// });

// router.post("/notify-partner", authMiddleware, async (req, res) => {
//     try {
//         const { orderId } = req.body;
//         const partnerId = req.user.partnerId; // Assuming partnerId is derived from the authenticated user

//         // Call the service function to handle partner notification
//         const notificationResult = await notifyPartnerForOrder(
//             orderId,
//             partnerId
//         );

//         res.status(200).json({
//             message: "Partner berhasil diberitahu tentang pembelian!",
//             data: notificationResult,
//         });
//     } catch (error) {
//         if (error instanceof ApiError) {
//             console.error("ApiError:", error);
//             return res.status(error.statusCode).json({
//                 message: error.message,
//             });
//         }

//         console.error("Error notifying partner:", error);
//         return res.status(500).json({
//             message: "Terjadi kesalahan di server!",
//             error: error.message,
//         });
//     }
// });

module.exports = router;

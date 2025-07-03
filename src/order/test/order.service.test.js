const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");

jest.mock("../order.repository"); // MOCK repository

const orderRepository = require("../order.repository");
const { handleMidtransNotification } = require("../order.service");

// Setup Express App
const app = express();
app.use(bodyParser.json());

// Inject route
app.post("/orders/midtrans/notification", async (req, res) => {
    try {
        await handleMidtransNotification(req.body);
        return res.status(200).json({ message: "Notifikasi berhasil diproses" });
    } catch (error) {
        return res.status(500).json({ message: "Gagal memproses notifikasi", error: error.message });
    }
});

describe("POST /orders/midtrans/notification", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should respond 200 and update payment status SUCCESS for credit_card capture", async () => {
        orderRepository.updateOrderPaymentStatus.mockResolvedValue({});

        const response = await request(app)
            .post("/orders/midtrans/notification")
            .send({
                order_id: "ORDER-123-abc",
                transaction_status: "capture",
                payment_type: "credit_card",
                fraud_status: "accept",
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: "Notifikasi berhasil diproses" });

        expect(orderRepository.updateOrderPaymentStatus).toHaveBeenCalledWith(123, {
            payment_status: "SUCCESS",
            payment_method: "credit_card",
        });
    });

    it("should respond 500 for invalid order_id", async () => {
        const response = await request(app)
            .post("/orders/midtrans/notification")
            .send({
                order_id: "INVALID_ID",
                transaction_status: "settlement",
                payment_type: "qris",
            });

        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe("Gagal memproses notifikasi");
    });
});



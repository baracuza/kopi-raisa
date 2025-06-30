const midtransClient = require("midtrans-client");

const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

const coreApi = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// Pemetaan metode internal ke payment_type Midtrans
const mapPaymentMethodToMidtransType = (method) => {
    switch (method.toUpperCase()) {
        case "QRIS":
            return "qris";
        case "CREDIT_CARD":
            return "credit_card";
        case "BANK_TRANSFER":
            return "bank_transfer";
        default:
            return null;
    }
};

const createMidtransSnapToken = async (order) => {

    const paymentType = mapPaymentMethodToMidtransType(order.payment.method);

    if (!paymentType) {
        throw new Error(`Metode pembayaran '${order.payment.method}' tidak didukung.`);
    }

    const customer = {
        first_name: order.user.name || "User",
        last_name: "",
        email: order.user.email || "user@example.com",
        phone: order.user.phone_number || "081234567890",
    };

    const items = order.orderItems.map((item) => ({
        id: item.product.id.toString(),
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
    }));

    items.push({
        id: 'SHIPPING',
        name: `Ongkos Kirim - ${order.shippingDetail.shipping_name || "Pengiriman"}`,
        price: order.shippingDetail.shipping_cost||0,
        quantity: 1,
    });

    const grossAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderId = `ORDER-${order.id}-${Date.now()}`;

    if (paymentType === "qris") {
        const parameter = {
            payment_type: "qris",
            transaction_details: {
                order_id: orderId,
                gross_amount: grossAmount,
            },
            item_details: items,
            customer_details: customer,
            qris: {
                acquirer: "gopay",
            },
        };

        const chargeResponse = await coreApi.charge(parameter);
        const qrUrl = chargeResponse.actions.find((a) => a.name === "generate-qr-code").url;
        return { type: "qris", qrUrl };
    }

    const snapParameter = {
        transaction_details: {
            order_id: orderId,
            gross_amount: grossAmount,
        },
        item_details: items,
        customer_details: customer,
        enabled_payments: [paymentType],
    };

    const snapResponse = await snap.createTransaction(snapParameter);
    return {
        type: "snap",
        snapToken: snapResponse.token,
        snapRedirectUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapResponse.token}`,
    };
};


module.exports = { createMidtransSnapToken };

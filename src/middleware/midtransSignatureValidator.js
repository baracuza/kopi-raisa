const crypto = require("crypto");

const verifyMidtransSignature = (req, res, next) => {
    const {
        order_id,
        status_code,
        gross_amount,
        signature_key: receivedSignature,
    } = req.body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const payload = order_id + status_code + gross_amount + serverKey;

    const hashed = crypto
        .createHash("sha512")
        .update(payload)
        .digest("hex");

    if (hashed !== receivedSignature) {
        console.warn("Invalid Midtrans signature!");
        return res.status(403).json({ message: "Forbidden. Invalid signature." });
    }

    next();
};

module.exports = verifyMidtransSignature;

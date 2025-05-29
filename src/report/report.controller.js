const express = require("express");

const { authMiddleware } = require("../middleware/middleware");
const ApiError = require("../utils/apiError");

const router = express.Router();

router.post("/", authMiddleware, async (req, res, next) => {
    try {
        const data = req.body;
        if (!data || Object.keys(data).length === 0) {
            throw new ApiError(400, "Data tidak boleh kosong");
        }

        console.log("Data received:", data);

        // proses simpan ke DB (jika ada) di sini

        res.status(201).json({
            status: "success",
            message: "Data berhasil diterima",
            data,
        });
    } catch (error) {
        console.error("Error in POST /:", error);
        next(new ApiError(500, "Gagal memproses laporan"));
    }
});


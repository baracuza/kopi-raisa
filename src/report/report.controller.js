const express = require("express");

const { authMiddleware } = require("../middleware/middleware");
const ApiError = require("../utils/apiError");
const { createFormTemplate } = require("./report.service");

const router = express.Router();

// router.post("/", authMiddleware, async (req, res, next) => {
//     try {
//         const data = req.body;
//         if (!data || Object.keys(data).length === 0) {
//             throw new ApiError(400, "Data tidak boleh kosong");
//         }

//         console.log("Data received:", data);

//         // proses simpan ke DB (jika ada) di sini

//         res.status(201).json({
//             status: "success",
//             message: "Data berhasil diterima",
//             data,
//         });
//     } catch (error) {
//         console.error("Error in POST /:", error);
//         next(new ApiError(500, "Gagal memproses laporan"));
//     }
// });

router.post("/", authMiddleware, async (req, res, next) => {
    try {
        if (!req.user.admin) {
            return res.status(403).json({ message: "Akses ditolak! Hanya admin yang bisa mengakses." });
        }
        
        const { title, google_form_link } = req.body;
        const formTemplate = await createFormTemplate({ title, google_form_link });

        res.status(201).json({
            status: "success",
            message: "Form template berhasil dibuat",
            data: formTemplate,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            })
        }

        console.error('Error create template google form :', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan di server!',
            error: error.message,
        });
    }
})

module.exports = router;
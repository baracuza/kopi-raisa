const express = require('express');
const apiError = require('../utils/apiError');
const uploadCompany = require('../middleware/multerCompany');

const { authMiddleware, companyMulterErrorHandler, validateAboutCompanyMedia, validateUpdateCompanyMedia } = require('../middleware/middleware');
const { companyValidator } = require('../validation/validation');
const { validationResult } = require('express-validator');
const handleValidationResult = require('../middleware/handleValidationResult');
const handleValidationResultFinal = require('../middleware/handleValidationResultFinal');
const {
    getAllCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    getVissionMissionData,
    removeCompanyById
} = require("./company.service");

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        if (!req.user.admin) {
            return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa mengakses.' });
        }

        const companies = await getAllCompanies();

        res.status(200).json({
            message: 'Data perusahaan berhasil didapatkan!',
            data: companies,
        });
    } catch (error) {
        if (error instanceof apiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error('Error getting companies:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan di server!',
            error: error.message,
        });
    }
})

router.post('/',
    authMiddleware, uploadCompany.single('imageCompany'),
    companyMulterErrorHandler,
    validateAboutCompanyMedia,
    handleValidationResult, handleValidationResultFinal, async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorObject = errors.array().reduce((acc, curr) => {
                    const key = curr.path && curr.path !== '' ? curr.path : 'global';
                    if (!acc[key]) {
                        acc[key] = curr.msg;
                    }
                    return acc;
                }, {});

                return res.status(400).json({
                    message: "Validasi gagal!",
                    errors: errorObject
                });
            }
            if (req.mediaValidationErrors && Object.keys(req.mediaValidationErrors).length > 0) {
                return res.status(400).json({
                    message: "Validasi gagal!",
                    errors: req.mediaValidationErrors
                });
            }

            if (!req.user.admin) {
                return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa mengakses.' });
            }

            const {
                titleCompany, descCompany,
                descVisi, descMisi
            } = req.body;

            const userId = req.user.id;
            const imageFile = req.file;

            //Inisialisasi objek untuk menampung semua error validasi
            const validationErrors = {};

            // -- Field: titleCompany --
            const cleanHtmlTitleCompany = DOMPurify.sanitize(titleCompany || "");
            const plainTextTitleCompany = (titleCompany || "").replace(/<[^>]+>/g, "").trim();
            if (!plainTextTitleCompany) {
                validationErrors.titleCompany = "Judul perusahaan tidak boleh kosong";
            }

            // -- Field: descCompany --
            const cleanHtmlDescCompany = DOMPurify.sanitize(descCompany || "");
            const plainTextDescCompany = (descCompany || "").replace(/<[^>]+>/g, "").trim();
            if (!plainTextDescCompany) {
                validationErrors.descCompany = "Deskripsi perusahaan tidak boleh kosong";
            }

            // -- Field: descVisi --
            const cleanHtmlDescVisi = DOMPurify.sanitize(descVisi || "");
            const plainTextDescVisi = (descVisi || "").replace(/<[^>]+>/g, "").trim();
            if (!plainTextDescVisi) {
                validationErrors.descVisi = "Deskripsi visi tidak boleh kosong";
            }

            // -- Field: descMisi --
            const cleanHtmlDescMisi = DOMPurify.sanitize(descMisi || "");
            const plainTextDescMisi = (descMisi || "").replace(/<[^>]+>/g, "").trim();
            if (!plainTextDescMisi) {
                validationErrors.descMisi = "Deskripsi misi tidak boleh kosong";
            }

            // 3. Cek apakah ada error yang terkumpul
            if (Object.keys(validationErrors).length > 0) {
                return res.status(400).json({
                    message: "Validasi gagal!",
                    errors: validationErrors
                });
            }

            const company = await createCompany({
                titleCompany: cleanHtmlTitleCompany,
                descCompany: cleanHtmlDescCompany,
                descVisi: cleanHtmlDescVisi,
                descMisi: cleanHtmlDescMisi,
                userId,
                image: imageFile
            });

            res.status(201).json({
                message: 'Perusahaan berhasil ditambahkan!',
                data: company,
            });

        } catch (error) {
            if (error instanceof apiError) {
                console.error('ApiError:', error);
                return res.status(error.statusCode).json({
                    message: error.message,
                });
            }

            console.error('Error adding company:', error);
            return res.status(500).json({
                message: 'Terjadi kesalahan di server!',
                error: error.message,
            });
        }
    })

router.put('/:id',
    authMiddleware,
    uploadCompany.single('imageCompany'),
    companyMulterErrorHandler,
    validateUpdateCompanyMedia,
    companyValidator,
    handleValidationResult,
    handleValidationResultFinal,
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorObject = errors.array().reduce((acc, curr) => {
                    const key = curr.path && curr.path !== '' ? curr.path : 'global';
                    if (!acc[key]) {
                        acc[key] = curr.msg;
                    }
                    return acc;
                }, {});

                return res.status(400).json({
                    message: "Validasi gagal!",
                    errors: errorObject
                });
            }
            if (req.mediaValidationErrors && Object.keys(req.mediaValidationErrors).length > 0) {
                return res.status(400).json({
                    message: "Validasi gagal!",
                    errors: req.mediaValidationErrors
                });
            }

            if (!req.user.admin) {
                return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa mengakses.' });
            }

            const { id } = req.params;
            const {
                titleCompany, descCompany,
                descVisi, descMisi
            } = req.body;

            const imageFile = req.file;

            //Inisialisasi objek untuk menampung semua error validasi
            const validationErrors = {};

            // -- Field: titleCompany --
            const cleanHtmlTitleCompany = DOMPurify.sanitize(titleCompany || "");
            const plainTextTitleCompany = (titleCompany || "").replace(/<[^>]+>/g, "").trim();
            if (!plainTextTitleCompany) {
                validationErrors.titleCompany = "Judul perusahaan tidak boleh kosong";
            }

            // -- Field: descCompany --
            const cleanHtmlDescCompany = DOMPurify.sanitize(descCompany || "");
            const plainTextDescCompany = (descCompany || "").replace(/<[^>]+>/g, "").trim();
            if (!plainTextDescCompany) {
                validationErrors.descCompany = "Deskripsi perusahaan tidak boleh kosong";
            }

            // -- Field: descVisi --
            const cleanHtmlDescVisi = DOMPurify.sanitize(descVisi || "");
            const plainTextDescVisi = (descVisi || "").replace(/<[^>]+>/g, "").trim();
            if (!plainTextDescVisi) {
                validationErrors.descVisi = "Deskripsi visi tidak boleh kosong";
            }

            // -- Field: descMisi --
            const cleanHtmlDescMisi = DOMPurify.sanitize(descMisi || "");
            const plainTextDescMisi = (descMisi || "").replace(/<[^>]+>/g, "").trim();
            if (!plainTextDescMisi) {
                validationErrors.descMisi = "Deskripsi misi tidak boleh kosong";
            }

            // 3. Cek apakah ada error yang terkumpul
            if (Object.keys(validationErrors).length > 0) {
                return res.status(400).json({
                    message: "Validasi gagal!",
                    errors: validationErrors
                });
            }

            const updatedCompany = await updateCompany(id, {
                titleCompany: cleanHtmlTitleCompany,
                descCompany: cleanHtmlDescCompany,
                descVisi: cleanHtmlDescVisi,
                descMisi: cleanHtmlDescMisi,
                image: imageFile, // Kirim file (atau undefined) ke service
            });

            res.status(200).json({
                message: 'Data perusahaan berhasil diperbarui!',
                data: updatedCompany,
            });

        } catch (error) {
            if (error instanceof apiError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            console.error('Error updating company:', error);
            return res.status(500).json({
                message: 'Terjadi kesalahan di server!',
                error: error.message,
            });
        }
    }
);

router.get('/:id', authMiddleware, async (req, res) => {
    try {

        if (!req.user.admin) {
            return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa mengakses.' });
        }

        const { id } = req.params;
        const company = await getCompanyById(id);

        if (!company) {
            return res.status(404).json({
                message: 'Data perusahaan tidak ditemukan!',
            });
        }

        res.status(200).json({
            message: 'Data perusahaan berhasil didapatkan!',
            data: company,
        });
    } catch (error) {
        if (error instanceof apiError) {
            console.error('ApiError:', error);
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error('Error getting company:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan di server!',
            error: error.message,
        });
    }
})



module.exports = router;
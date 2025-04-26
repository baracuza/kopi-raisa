const express = require('express');
const prisma = require('../db');
const upload = require('../middleware/multer');
const createDOMPurify = require('isomorphic-dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);



const { uploadToCloudinary } = require('../services/cloudinaryUpload.service');
const { validationResult } = require('express-validator');
const { deleteFromCloudinaryByUrl, extractPublicId } = require('../utils/cloudinary');
const handleValidationResult = require('../middleware/handleValidationResult');
const { authMiddleware, validateUpdateNewsMedia, validateInsertNewsMedia, multerErrorHandler } = require('../middleware/middleware');
const { createNewsValidator, updateNewsValidator } = require('../validation/user.validation');
const handleValidationResultFinal = require('../middleware/handleValidationResultFinal');

const { getNews,
    getNewsById,
    updateNews,
    removeNews,
    createNewsWithMedia,
    postImagesToFacebook,
    postImagesToInstagram } = require('./news.service');

const router = express.Router();

/**
 * @swagger
 * /api/v1/news:
 *   get:
 *     summary: Ambil semua data berita
 *     tags:
 *       - News
 *     responses:
 *       200:
 *         description: Data berita berhasil didapatkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Data berita berhasil didapatkan!
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1"
 *                       title:
 *                         type: string
 *                         example: "Judul Berita"
 *                       content:
 *                         type: string
 *                         example: "Isi lengkap berita di sini..."
 *                       image:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-24T12:34:56Z"
 *       500:
 *         description: Gagal mendapatkan data berita
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Gagal mendapatkan data berita!
 *                 error:
 *                   type: string
 *                   example: Terjadi kesalahan pada server
 */

router.get('/', async (req, res) => {
    // console.log('GET /api/v1/news');
    try {
        const news = await getNews();

        res.status(200).json({
            message: 'Data berita berhasil didapatkan!',
            data: news,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal mendapatkan data berita!',
            error: error.message,
        });
    }
});

/**
 * @swagger
 * /api/v1/news/{id}:
 *   get:
 *     summary: Ambil detail berita berdasarkan ID
 *     tags:
 *       - News
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID berita
 *     responses:
 *       200:
 *         description: Data berita berhasil didapatkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Data berita berhasil didapatkan!
 *                 data:
 *                   type: object
 *       404:
 *         description: Data berita tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Data berita tidak ditemukan!
 *       500:
 *         description: Gagal mendapatkan data berita
 */

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const news = await getNewsById(id);

        if (!news) {
            return res.status(404).json({
                message: 'Data berita tidak ditemukan!',
            });
        }

        res.status(200).json({
            message: 'Data berita berhasil didapatkan!',
            data: news,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal mendapatkan data berita!',
            error: error.message,
        });
    }
});

/**
 * @swagger
 * /api/v1/news/post:
 *   post:
 *     summary: Tambah berita baru (admin only)
 *     tags:
 *       - News
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Pelatihan Barista Profesional"
 *               content:
 *                 type: string
 *                 example: "<p>Deskripsi berita lengkap di sini...</p>"
 *               postToFacebook:
 *                 type: string
 *                 enum: [true, false]
 *                 example: "false"
 *               postToInstagram:
 *                 type: string
 *                 enum: [true, false]
 *                 example: "true"
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Berita berhasil ditambahkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berita berhasil ditambahkan dan diposting!
 *                 data:
 *                   type: object
 *       400:
 *         description: Validasi gagal atau akun sosial belum terhubung
 *       403:
 *         description: Hanya admin yang bisa posting
 *       500:
 *         description: Gagal menyimpan berita atau upload media
 */

router.post('/post', authMiddleware, upload.fields([{ name: 'media', maxCount: 4 }, { name: 'thumbnail', maxCount: 1 }]),
    multerErrorHandler, validateInsertNewsMedia, createNewsValidator, handleValidationResult, handleValidationResultFinal, async (req, res) => {
        console.log("DEBUG req.body keys:", Object.keys(req.body));
        console.log("DEBUG req.body.title:", req.body.title);
        console.log("DEBUG req.body.content:", req.body.content);
        console.log("DEBUG req.files:", req.files);
        console.log("DEBUG req.files['thumbnail']:", req.files?.['thumbnail']);
        console.log("DEBUG req.files['media']:", req.files?.['media']);
        try {
            console.log("BODY DARI CLIENT:", req.body);

            // Cek validasi input dari express-validator
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

            const { title, content, postToFacebook, postToInstagram } = req.body;
            const user_id = req.user.id;

            // Validasi agar hanya admin bisa publish berita
            if (!req.user.admin) {
                return res.status(403).json({ message: 'Hanya admin yang dapat mempublikasi berita!' });
            }

            // Sanitize HTML untuk disimpan
            const cleanHtml = DOMPurify.sanitize(content || "");

            // Bersihkan konten dari tag HTML
            const plainContent = content
                .replace(/<[^>]+>/g, "")
                .replace(/\s+/g, " ")
                .trim();

            if (!plainContent) {
                return res.status(400).json({
                    message: "Validasi gagal!",
                    errors: { content: "*Konten/Deskripsi Tidak Boleh Kosong" }
                });
            }

            const mediaFiles = req.files['media'] || [];
            const thumbnailFile = req.files['thumbnail']?.[0] || null;

            let thumbnailUrl = null;
            let uploadedResults = [];
            if (thumbnailFile) {
                try {
                    // Upload thumbnail ke Cloudinary
                    thumbnailUrl = await uploadToCloudinary(thumbnailFile.buffer, thumbnailFile.originalname);
                    console.log("✅ Thumbnail berhasil diupload:", thumbnailUrl);
                } catch (uploadError) {
                    console.error('Gagal mengupload thumbnail ke Cloudinary:', uploadError.message);
                    console.error('❌ Gagal upload thumbnail:', uploadError.message);
                    return res.status(500).json({
                        message: 'Gagal mengupload thumbnail ke Cloudinary',
                        error: uploadError.message
                    });
                }
            }

            if (mediaFiles.length > 0) {
                const uploadPromises = mediaFiles.map(file =>
                    uploadToCloudinary(file.buffer, file.originalname));
                try {
                    // Upload semua file ke Cloudinary secara paralel
                    uploadedResults = await Promise.all(uploadPromises);
                    console.log("✅ Media berhasil diupload:", uploadedResults);

                } catch (uploadError) {
                    console.error('Gagal mengupload ke Cloudinary:', uploadError.message);
                    return res.status(500).json({
                        message: 'Gagal mengupload media ke Cloudinary',
                        error: uploadError.message
                    });
                }
            }

            // Gabungkan URL dan mimetype untuk disimpan ke DB
            let mediaInfos = mediaFiles.map((file, index) => ({
                url: uploadedResults[index],
                public_id: extractPublicId(uploadedResults[index]), // fungsi bisa dari getPublicIdFromUrl atau langsung dari upload result
                mimetype: file.mimetype,
                isThumbnail: false,
            }));
            if (thumbnailFile && thumbnailUrl) {
                mediaInfos.unshift({
                    url: thumbnailUrl,
                    public_id: extractPublicId(thumbnailUrl),
                    mimetype: thumbnailFile.mimetype,
                    isThumbnail: true,
                });
            }

            let news;
            try {
                console.log("📦 Data sebelum insert:", {
                    title,
                    content: cleanHtml,
                    mediaInfos,
                    thumbnailUrl,
                });
                // Simpan ke DB
                news = await createNewsWithMedia({
                    title,
                    content: cleanHtml,
                    mediaInfos,
                    thumbnailUrl,
                }, user_id);

            } catch (dbError) {
                console.error('Gagal menyimpan berita:', dbError.message);
                // Rollback: Hapus dari Cloudinary jika simpan ke DB gagal
                await Promise.all(
                    uploadedResults.map(url => deleteFromCloudinaryByUrl(url))
                );
                return res.status(500).json({
                    message: 'Gagal menyimpan berita',
                    error: dbError.message
                });

            }

            // Optional: Jika dicentang untuk auto-post ke Facebook
            if (postToFacebook === 'true') {
                const fbAccount = await prisma.facebookAccount.findUnique({
                    where: { userId: user_id }
                });
                if (!fbAccount) {
                    return res.status(400).json({ message: 'Akun Facebook belum terhubung!' });
                }
                // Pisahkan media berdasarkan tipe
                const images = mediaInfos.filter(media => media.mimetype.startsWith('image/'));
                // const videos = mediaInfos.filter(media => media.mimetype.startsWith('video/'));
                try {
                    // Posting gambar sebagai carousel jika lebih dari satu, atau sebagai gambar tunggal
                    if (images.length > 0) {
                        await postImagesToFacebook({
                            pageId: fbAccount.page_id,
                            pageAccessToken: fbAccount.page_access_token,
                            images,
                            caption: `${title}\n\n${plainContent}`
                        });
                    }

                } catch (fbError) {
                    console.error('Gagal posting ke Facebook:', fbError.message);
                    return res.status(201).json({
                        message: 'Berita berhasil disimpan, namun gagal diposting ke Facebook.',
                        data: news,
                        error: fbError.message
                    });
                }
            }

            if (postToInstagram === 'true') {
                const igAccount = await prisma.facebookAccount.findUnique({
                    where: { userId: user_id }
                });
                if (!igAccount) {
                    return res.status(400).json({ message: 'Akun Instagram belum terhubung!' });
                }
                // Pisahkan media berdasarkan tipe
                const images = mediaInfos.filter(media => media.mimetype.startsWith('image/'));
                // const videos = mediaInfos.filter(media => media.mimetype.startsWith('video/'));
                try {
                    // Posting gambar sebagai carousel jika lebih dari satu, atau sebagai gambar tunggal
                    if (images.length > 0) {
                        await postImagesToInstagram({
                            igUserId: igAccount.ig_user_id,
                            accessToken: igAccount.page_access_token,
                            images,
                            caption: `${title}\n\n${plainContent}`
                        });
                    }

                } catch (igError) {
                    console.error('Gagal posting ke Instagram:', igError.message);
                    return res.status(201).json({
                        message: 'Berita berhasil disimpan, namun gagal diposting ke Instagram.',
                        data: news,
                        error: igError.message
                    });
                }
            }
            return res.status(201).json({ message: 'Berita berhasil ditambahkan dan diposting!', data: news });

        } catch (error) {
            console.error('Gagal memposting:', error);
            return res.status(500).json({ message: 'Gagal memposting konten', error: error.message });
        }
    })

    /**
 * @swagger
 * /api/v1/news/{id}:
 *   put:
 *     summary: Update berita berdasarkan ID (admin only)
 *     tags:
 *       - News
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID berita yang ingin diupdate
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Judul Berita Terbaru"
 *               content:
 *                 type: string
 *                 example: "<p>Konten berita setelah update</p>"
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Berita berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berita berhasil diupdate!
 *                 data:
 *                   type: object
 *       400:
 *         description: Validasi gagal
 *       403:
 *         description: Akses ditolak! Hanya admin
 *       500:
 *         description: Gagal mengupdate berita
 */

router.put('/:id', authMiddleware, upload.fields([{ name: 'media', maxCount: 4 }, { name: 'thumbnail', maxCount: 1 }]),
    updateNewsValidator, validateUpdateNewsMedia, handleValidationResult, handleValidationResultFinal({ skipIfNoFile: true }), async (req, res) => {
        try {
            // Cek validasi input dari express-validator
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

            if (!req.user.admin) {
                return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa mengedit berita.' });
            }
            const { id } = req.params;
            const { title, content, retainedMedia } = req.body;

            // Sanitize HTML untuk disimpan
            const cleanHtml = DOMPurify.sanitize(content || "");

            // Bersihkan konten dari tag HTML
            const plainContent = content
                .replace(/<[^>]+>/g, "")
                .replace(/\s+/g, " ")
                .trim();

            if (!plainContent) {
                return res.status(400).json({
                    message: "Validasi gagal!",
                    errors: { content: "*Konten/Deskripsi Tidak Boleh Kosong" }
                });
            }

            const editedData = {
                title,
                content: cleanHtml,
                mediaFiles: req.files['media'],
                thumbnailFile: req.files['thumbnail']?.[0] || null,
                retainedMedia: retainedMedia ? JSON.parse(retainedMedia) : []
            };

            console.log("Mulai update berita");
            const updatedNews = await updateNews(parseInt(id), editedData);
            console.log("Selesai update berita, mengirim response...");

            res.status(200).json({
                message: 'Berita berhasil diupdate!',
                data: updatedNews,
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Gagal mengupdate berita!',
                error: error.message,
            });
        }
    });

    /**
 * @swagger
 * /api/v1/news/{id}:
 *   delete:
 *     summary: Hapus berita berdasarkan ID (admin only)
 *     tags:
 *       - News
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID berita yang ingin dihapus
 *     responses:
 *       200:
 *         description: Berita berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berita berhasil dihapus!
 *                 data:
 *                   type: object
 *       403:
 *         description: Akses ditolak! Hanya admin
 *       500:
 *         description: Gagal menghapus berita
 */

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.user.admin) {
            return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa menghapus berita.' });
        }
        const deletedNews = await removeNews(parseInt(id));

        res.status(200).json({
            message: 'Berita berhasil dihapus!',
            data: deletedNews,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal menghapus berita!',
            error: error.message,
        });
    }
});

module.exports = router;
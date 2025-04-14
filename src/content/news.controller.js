const express = require('express');
const prisma = require('../db');
const upload = require('../middleware/multer');
const { uploadToCloudinary } = require('../services/cloudinaryUpload.service');
const { validationResult } = require('express-validator');
const { deleteFromCloudinaryByUrl, extractPublicId } = require('../utils/cloudinary');
const { authMiddleware, validateNewsMedia } = require('../middleware/middleware');
const { newsValidator } = require('../validation/user.validation');

const { getNews,
    getNewsById,
    updateNews,
    removeNews,
    createNewsWithMedia,
    postVideoToFacebook,
    postImagesToFacebook, } = require('./news.service');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
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

router.post('/post', authMiddleware, upload.array('media', 5), newsValidator, validateNewsMedia, async (req, res) => {
    try {
        console.log("BODY DARI CLIENT:", req.body);

        // Cek validasi input dari express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validasi gagal!',
                errors: errors.array().reduce((acc, curr) => {
                    if (!acc[curr.path]) {
                        acc[curr.path] = curr.msg;
                    }
                    return acc;
                }, {})

            });
        }

        const { title, content, postToFacebook } = req.body;
        const published = req.body.published === 'true';
        const user_id = req.user.id;

        // Validasi agar hanya admin bisa publish berita
        if (published && !req.user.admin) {
            return res.status(403).json({ message: 'Hanya admin yang dapat mempublikasi berita!' });
        }

        let uploadedResults;
        try {
            // Upload semua file ke Cloudinary secara paralel
            uploadedResults = await Promise.all(
                req.files.map(file => uploadToCloudinary(file.buffer, file.originalname))
            );

        } catch (uploadError) {
            console.error('Gagal mengupload ke Cloudinary:', uploadError.message);
            return res.status(500).json({
                message: 'Gagal mengupload media ke Cloudinary',
                error: uploadError.message
            });

        }

        // Gabungkan URL dan mimetype untuk disimpan ke DB
        const mediaInfos = req.files.map((file, index) => ({
            url: uploadedResults[index],
            public_id: extractPublicId(uploadedResults[index]), // fungsi bisa dari getPublicIdFromUrl atau langsung dari upload result
            mimetype: file.mimetype,
        }));

        let news;
        try {
            // Simpan ke DB
            news = await createNewsWithMedia({
                title,
                content,
                published: published === 'true',
                mediaInfos,
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
            const videos = mediaInfos.filter(media => media.mimetype.startsWith('video/'));
            try {
                // Posting gambar sebagai carousel jika lebih dari satu, atau sebagai gambar tunggal
                if (images.length > 0) {
                    await postImagesToFacebook({
                        pageId: fbAccount.page_id,
                        pageAccessToken: fbAccount.access_token,
                        images,
                        caption: `${title}\n\n${content}`
                    });
                }

                // Posting video secara terpisah
                for (const video of videos) {
                    await postVideoToFacebook({
                        pageId: fbAccount.page_id,
                        pageAccessToken: fbAccount.access_token,
                        videoUrl: video.url,
                        caption: `${title}\n\n${content}`
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
        return res.status(201).json({ message: 'Berita berhasil ditambahkan dan diposting!', data: news });

    } catch (error) {
        console.error('Gagal memposting:', error);
        return res.status(500).json({ message: 'Gagal memposting konten', error: error.message });
    }
})

router.put('/:id', authMiddleware, upload.single('media'), newsValidator, async (req, res) => {
    try {
        // Cek validasi input dari express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validasi gagal!',
                errors: errors.array().reduce((acc, curr) => {
                    if (!acc[curr.path]) {
                        acc[curr.path] = curr.msg;
                    }
                    return acc;
                }, {})

            });
        }
        if (!req.user.admin) {
            return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa mengedit berita.' });
        }
        const { id } = req.params;
        const { title, content } = req.body;


        const editedData = {
            title,
            content,
        };

        if (req.file) {
            editedData.mediaBuffer = req.file.buffer;
            editedData.mediaOriginalName = req.file.originalname;
            editedData.mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
        }

        const updatedNews = await updateNews(parseInt(id), editedData);

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
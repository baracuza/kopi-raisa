const express = require('express');
const prisma = require('../db');
const upload = require('../middleware/multer');
const { uploadToCloudinary } = require('../services/cloudinaryUpload.service');

const { getNews, getNewsById, createNewsWithMedia, postToFacebookPage, updateNews, removeNews } = require('./news.service');
const { authMiddleware } = require('../middleware/middleware');

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

router.post('/post', authMiddleware, upload.array('media', 5), async (req, res) => {
    try {
        const { title, content, published, postToFacebook } = req.body;
        const user_id = req.user.id;

        // Upload semua file ke Cloudinary secara paralel
        const uploadedResults = await Promise.all(
            req.files.map(file => uploadToCloudinary(file.buffer, file.originalname))
        );

        // Gabungkan URL dan mimetype untuk disimpan ke DB
        const mediaInfos = req.files.map((file, index) => ({
            url: uploadedResults[index],
            mimetype: file.mimetype,
        }));

        // Simpan ke DB
        const news = await createNewsWithMedia({
            title,
            content,
            published: published === 'true',
            mediaInfos,
        }, user_id);

        // Optional: Jika dicentang untuk auto-post ke Facebook
        if (postToFacebook === 'true') {
            const fbAccount = await prisma.facebookAccount.findUnique({
                where: { userId: user_id }
            });
            if (!fbAccount) {
                return res.status(400).json({ message: 'Akun Facebook belum terhubung!' });
            }
        }
        // Loop dan post semua media ke Facebook Page
        for (const media of mediaInfos) {
            await postToFacebookPage({
                pageId: fb.page_id,
                pageAccessToken: fb.access_token,
                imageUrl: media.url,
                caption: `${title}\n\n${content}`
            });
        }
        return res.status(201).json({ message: 'Berita berhasil ditambahkan dan diposting!', data: news });

    } catch (error) {
        console.error('Gagal memposting:', error);
        return res.status(500).json({ message: 'Gagal memposting konten', error: error.message });

    }
})

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const editedNewsData = req.body;

        if (!req.user.admin) {
            return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa mengedit berita.' });
        }

        const updatedNews = await updateNews(parseInt(id), editedNewsData);

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
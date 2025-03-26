const express = require('express');
const prisma = require('../db');


const { getNews, getNewsById, createNews, updateNews, removeNews } = require('./news.service');
const { authMiddleware } = require('../middleware/middleware');

const router = express.Router();

router.get('/',authMiddleware, async (req, res) => {
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

router.post('/', authMiddleware, async (req, res) => {
    try {
        if (!req.user.admin) {
            return res.status(403).json({ message: 'Akses ditolak! Hanya admin yang bisa menambahkan berita.' });
        }
        const newsData = req.body;
        const user_id = req.user.id;
        const newNews = await createNews(newsData, user_id);

        res.status(201).json({
            message: 'Berita berhasil ditambahkan!',
            data: newNews,
        });
    } catch (error) {
        return res.status(500).json({message: 'Gagal menambahkan berita!', error: error.message});
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const editedNewsData = req.body;
        const updatedNews = await updateNews(id, editedNewsData);

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
        const deletedNews = await removeNews(id);

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
const prisma = require('../db');
const axios = require('axios');

const {
    updateNewsData,
    getAllNews,
    getNewsByIdData,
    insertNews,
    addNewsMedia,
    deleteNews,
} = require("./news.repository");

const getNews = async () => {
    const news = await getAllNews();
    return news;
};

const getNewsById = async (newsId) => {
    const news = await getNewsByIdData(newsId);
    if (!news) {
        throw new Error("Berita tidak ditemukan!");
    }
    return news;
};

const createNewsWithMedia = async (newsData, user_id) => {
    const { title, content, published, mediaInfos } = newsData;
    const news = await insertNews({ title, content, published, user_id });

    // Simpan semua media secara paralel
    await Promise.all(
        mediaInfos.map(media =>
            addNewsMedia(news.id, media.url, media.mimetype)
        )
    );
    return news;
}

const postToFacebookPage = async ({ pageId, pageAccessToken, imageUrl, caption }) => {
    try {
        const res = await axios.post(`https://graph.facebook.com/v19.0/${pageId}/photos`, null, {
            params: {
                url: imageUrl,
                caption,
                access_token: pageAccessToken
            }
        });
        return res.data;
    } catch (error) {
        console.error('Gagal posting ke Facebook Page:', error.response?.data || error.message);
        throw new Error('Posting ke Facebook gagal: ' + (error.response?.data?.error?.message || error.message));
    }
};


const updateNews = async (id, editedNewsData) => {
    const existingNews = await getNewsByIdData(id);
    if (!existingNews) {
        throw new Error("Berita tidak ditemukan!");
    }
    const newsData = await updateNewsData(id, editedNewsData);
    return newsData;
};

const removeNews = async (id) => {
    const existingNews = await getNewsByIdData(id);
    if (!existingNews) {
        throw new Error("Berita tidak ditemukan!");
    }
    const newsData = await deleteNews(id);

    return newsData;
};

module.exports = { getNews, getNewsById, createNewsWithMedia, postToFacebookPage, updateNews, removeNews };
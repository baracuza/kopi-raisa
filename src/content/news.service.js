const prisma = require('../db');

const {
    findNews,
    findNewsById,
    insertNews,
    deleteNews,
    editNews
} = require("./news.repository");

const getNews = async () => {
    const news = await findNews();

    return news;
};

const getNewsById = async (newsId) => {
    const news = await findNewsById(newsId);
    if (!news) {
        throw new Error("Berita tidak ditemukan!");
    }

    return news;
};

const createNews = async (newNewsData,user_id) => {
    const newsData = await insertNews(newNewsData,user_id);

    return newsData;
};

const updateNews = async (id, editedNewsData) => {
    const newsData = await editNews(id, editedNewsData);

    return newsData;
};

const removeNews = async (id) => {
    const newsData = await deleteNews(id);

    return newsData;
};

module.exports = { getNews, getNewsById, createNews, updateNews, removeNews };
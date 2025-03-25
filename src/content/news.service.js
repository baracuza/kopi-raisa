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

const getNewsById = async (id) => {
    const news = await findNewsById(id);

    return news;
};

const createNews = async (newNewsData) => {
    const newsData = await insertNews(newNewsData);

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
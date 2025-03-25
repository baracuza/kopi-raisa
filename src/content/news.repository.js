const prisma = require('../db');

const findNews = async () => {
    const news = await prisma.News.findMany();

    return news;
};

const findNewsById = async (id) => {
    const news = await prisma.News.findUnique({
        where: {
            id: parseInt(id)
        }
    });

    return news;
};

const insertNews = async (newNewsData) => {};

const deleteNews = async (id) => {};
const editNews = async (id, editedNewsData) => {};

module.exports = { findNews, findNewsById, insertNews, deleteNews, editNews };
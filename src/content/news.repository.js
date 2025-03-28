const prisma = require('../db');

const findNews = async () => {
    const news = await prisma.News.findMany();

    return news;
};

const findNewsById = async (newsId) => {
    const news = await prisma.News.findUnique({
        where: {
            id: parseInt(newsId)
        },
        // include:{
        //     user:{
        //         select: { id: true, name: true, email: true }
        //     }
        // }
    });

    return news;
};

const insertNews = async (newNewsData,user_id) => {
    const news = await prisma.News.create({
        data: {
            title       : newNewsData.title,
            content     : newNewsData.content,
            image_url   : newNewsData.image_url||null,
            user_id     : user_id,
            published_at: newNewsData.published||null,
        },
    });

    return news;
};

const editNews = async (id, editedNewsData) => {
    const news = await prisma.News.update({
        where: {
            id: parseInt(id),
        },
        data: {
            title       : editedNewsData.title,
            content     : editedNewsData.content,
            image_url   : editedNewsData.image_url||null,
            published_at: editedNewsData.published||null,
        },
    });

    return news;
};

const deleteNews = async (id) => {
    const news = await prisma.News.delete({
        where: {
            id: id,
        },
    });

    return news;
};

module.exports = { findNews, findNewsById, insertNews, deleteNews, editNews };
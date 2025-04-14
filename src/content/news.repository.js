const prisma = require('../db');

const getAllNews = async () => {
    return await prisma.news.findMany({
        include: { newsMedia: true, user: true },
        orderBy: { created_at: 'desc' }// field di schema
    });
};

const getNewsByIdData = async (id) => {
    return await prisma.news.findUnique({
        where: { id: parseInt(id) },
        include: { newsMedia: true, user: true }
    });
};

const getNewsMediaByNewsId = async (newsId) => {
    return await prisma.newsMedia.findMany({
        where: { news_id: parseInt(newsId) }
    });
};

const insertNews = async ({ title, content, published, user_id }) => {
    const news = await prisma.news.create({
        data: {
            title,
            content,
            published,
            user: { connect: { id: user_id } },
        },
    });
    return news;
};

const addNewsMedia = async (newsId, url, mimetype) => {
    return await prisma.newsMedia.create({
        data: {
            news_id: newsId,
            media_url: url,
            media_type: mimetype,
        },
    });
};

//belum dipakai
const addMultipleNewsMedia = async (newsId, mediaUrls) => {
    const mediaData = mediaUrls.map((url, mimetype) => ({
        news_id: newsId,
        media_url: url,
        media_type: mimetype
    }));
    return await prisma.newsMedia.createMany({
        data: mediaData,
    });
}

const updateNewsData = async (id, data) => {
    return await prisma.news.update({
        where: { id: parseInt(id) },
        data
    });
};

const deleteNewsMediaByNewsId = async (newsId) => {
    return await prisma.newsMedia.deleteMany({
        where: { news_id: parseInt(newsId) }
    });
};

const deleteNews = async (id) => {
    await prisma.newsMedia.deleteMany({ where: { news_id: parseInt(id) } });
    return await prisma.news.delete({ where: { id: parseInt(id) } });
};

module.exports = { getNewsByIdData, insertNews, addNewsMedia, addMultipleNewsMedia, deleteNews, deleteNewsMediaByNewsId, updateNewsData, getAllNews };
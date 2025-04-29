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

const insertNews = async ({ title, content, user_id }) => {
    const news = await prisma.news.create({
        data: {
            title,
            content,
            user: { connect: { id: user_id } },
        },
    });
    console.log("✅ Data berhasil disimpan:", news);
    return news;
};

const addNewsMedia = async (newsId, url, mimetype, isThumbnail) => {
    return await prisma.newsMedia.create({
        data: {
            news_id: newsId,
            media_url: url,
            media_type: mimetype,
            isThumbnail
        },
    });
};

const deleteNewsMediaByUrls = async (urls) => {
    return prisma.newsMedia.deleteMany({
        where: { media_url: { in: urls } }
    });
};

const deleteNewsMediaByIds = async (ids) => {
    return prisma.newsMedia.deleteMany({
        where: { id: { in: ids } }
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

//UPDATE NEWS
const updateNewsData = async (id, data) => {
    return await prisma.news.update({
        where: { id: parseInt(id) },
        data
    });
};

const deleteThumbnailNewsMedia = async (newsId) => {
    return await prisma.newsMedia.deleteMany({
        where: {
            news_id: parseInt(newsId),
            isThumbnail: true
        }
    });
}

const deleteNewsMediaByNewsId = async (newsId) => {
    return await prisma.newsMedia.deleteMany({
        where: { news_id: parseInt(newsId) }
    });
};

const deleteNews = async (id) => {
    await prisma.newsMedia.deleteMany({ where: { news_id: parseInt(id) } });
    return await prisma.news.delete({ where: { id: parseInt(id) } });
};

module.exports = { getNewsByIdData, insertNews, addNewsMedia, deleteNewsMediaByIds,deleteNewsMediaByUrls, deleteThumbnailNewsMedia, addMultipleNewsMedia, deleteNews, deleteNewsMediaByNewsId, updateNewsData, getAllNews, getNewsMediaByNewsId };
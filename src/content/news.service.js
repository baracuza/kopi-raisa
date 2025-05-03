const prisma = require('../db');
const axios = require('axios');
const ApiError = require('../utils/apiError');

const { deleteFromCloudinaryByUrl, extractPublicId } = require('../utils/cloudinary');
const { uploadToCloudinary } = require('../services/cloudinaryUpload.service');


const {
    updateNewsData,
    getAllNews,
    getNewsByIdData,
    getNewsMediaByNewsId,
    insertNews,
    addNewsMedia,
    deleteNewsMediaByIds,
    deleteNewsMediaByUrls,
    deleteNews,
    deleteThumbnailNewsMedia,
    deleteNewsMediaByNewsId
} = require("./news.repository");

const getNews = async () => {
    const news = await getAllNews();
    return news;
};

const getNewsById = async (newsId) => {
    const news = await getNewsByIdData(newsId);
    if (!news) {
        throw new ApiError(404, "*Berita tidak ditemukan!");
    }
    return news;
};

const createNewsWithMedia = async (newsData, user_id) => {
    const { title, content, mediaInfos } = newsData;
    const news = await insertNews({ title, content, user_id });

    // Simpan semua media secara paralel
    await Promise.all(
        mediaInfos.map(media =>
            addNewsMedia(news.id, media.url, media.mimetype, media.isThumbnail)
        )
    );
    return news;
}

const postImagesToFacebook = async ({ pageId, pageAccessToken, images, caption }) => {
    try {
        // Upload setiap gambar dan dapatkan media_id
        const mediaIds = [];
        for (const image of images) {
            const res = await axios.post(`https://graph.facebook.com/v20.0/${pageId}/photos`, null, {
                params: {
                    url: image.url,
                    published: false,
                    access_token: pageAccessToken
                }
            });
            if (!res.data.id) {
                console.warn('Facebook API tidak mengembalikan media ID:', res.data);
                continue;
            }
            mediaIds.push(res.data.id);
        }

        // Buat carousel post jika lebih dari satu gambar
        if (mediaIds.length > 1) {
            await axios.post(`https://graph.facebook.com/v20.0/${pageId}/feed`, null, {
                params: {
                    attached_media: mediaIds.map(id => ({ media_fbid: id })),
                    message: caption,
                    access_token: pageAccessToken
                }
            });
        } else if (mediaIds.length === 1) {
            // Jika hanya satu gambar, publikasikan langsung
            await axios.post(`https://graph.facebook.com/v20.0/${pageId}/photos`, null, {
                params: {
                    url: images[0].url,
                    caption,
                    access_token: pageAccessToken
                }
            });
        }
    } catch (error) {
        console.error('Gagal memposting gambar ke Facebook:', error.response?.data || error.message);
        throw new Error('*Posting gambar ke Facebook gagal: ' + (error.response?.data?.error?.message || error.message));
    }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const waitForMediaReady = async (creationId, accessToken, maxAttempts = 10, interval = 1500) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const res = await axios.get(`https://graph.facebook.com/v18.0/${creationId}`, {
            params: {
                fields: 'status_code',
                access_token: accessToken
            }
        });

        const status = res.data.status_code;
        if (status === 'FINISHED') return true;
        if (status === 'ERROR') throw new Error('*Media gagal diproses oleh Instagram');

        await delay(interval); // tunggu sebelum cek ulang
    }
    throw new Error('*Media belum siap setelah beberapa kali percobaan');
};

const postImagesToInstagram = async ({ igUserId, images, caption, accessToken }) => {
    try {
        const mediaIds = [];

        // Step 1: Buat container untuk tiap image
        for (const image of images) {
            const res = await axios.post(`https://graph.facebook.com/v18.0/${igUserId}/media`, null, {
                params: {
                    image_url: image.url,
                    is_carousel_item: images.length > 1 ? true : undefined,
                    caption: images.length === 1 ? caption : undefined, // hanya caption jika 1 gambar
                    access_token: accessToken
                }
            });

            const creationId = res.data.id;
            // Tunggu media siap
            await waitForMediaReady(creationId, accessToken);

            mediaIds.push(creationId);
        }


        // Step 2: Publish sebagai carousel jika lebih dari satu
        if (mediaIds.length > 1) {
            const carousel = await axios.post(`https://graph.facebook.com/v18.0/${igUserId}/media`, null, {
                params: {
                    children: mediaIds,
                    media_type: 'CAROUSEL',
                    caption,
                    access_token: accessToken
                }
            });

            const creationId = carousel.data.id;

            // Tunggu carousel siap
            await waitForMediaReady(creationId, accessToken);

            // Step 3: Publish carousel
            const publish = await axios.post(`https://graph.facebook.com/v18.0/${igUserId}/media_publish`, null, {
                params: {
                    creation_id: creationId,
                    access_token: accessToken
                }
            });

            return publish.data;
        } else {
            // Publish langsung untuk 1 gambar
            const publish = await axios.post(`https://graph.facebook.com/v18.0/${igUserId}/media_publish`, null, {
                params: {
                    creation_id: mediaIds[0],
                    access_token: accessToken
                }
            });

            return publish.data;
        }

    } catch (error) {
        console.error('Gagal post ke Instagram:', error.response?.data || error.message);
        throw new Error('*Posting ke Instagram gagal: ' + (error.response?.data?.error?.message || error.message));
    }
};

const postVideoToFacebook = async ({ pageId, pageAccessToken, videoUrl, caption }) => {
    try {
        await axios.post(`https://graph.facebook.com/v20.0/${pageId}/videos`, null, {
            params: {
                file_url: videoUrl,
                description: caption,
                access_token: pageAccessToken
            }
        });
    } catch (error) {
        console.error('Gagal memposting video ke Facebook:', error.response?.data || error.message);
        throw new Error('*Posting video ke Facebook gagal: ' + (error.response?.data?.error?.message || error.message));
    }
};


const updateNews = async (id, editedNewsData) => {
    const existingNews = await getNewsMediaByNewsId(id);
    const existingNewsThumbnail = existingNews.find(media => media.isThumbnail);

    if (!existingNewsThumbnail) {
        throw new ApiError(404, "*Berita tidak ditemukan!");
    }

    const { title, content, mediaFiles=[], thumbnailFile, retainedMedia=[] } = editedNewsData;

    // Update data berita
    const updatedNews = await updateNewsData(id, {
        title,
        content
    });

    // Update thumbnail jika ada
    if (thumbnailFile) {
        try {
            if (existingNewsThumbnail) {
                await deleteFromCloudinaryByUrl(existingNewsThumbnail.media_url);  // Hapus thumbnail lama
                await deleteThumbnailNewsMedia(id) // Hapus thumbnail dari DB
            }
            const thumbnailUrl = await uploadToCloudinary(thumbnailFile.buffer, thumbnailFile.originalname);
            await addNewsMedia(id, thumbnailUrl, 'image', true);

        } catch (error) {
            console.error("Gagal mengupdate thumbnail:", error.message);
            throw new ApiError(500, "Gagal mengupdate thumbnail berita!");
        }
    }

    // Hapus media lama yang tidak dipertahankan
    const mediaToDelete = existingNews.filter(media =>
        !media.isThumbnail && !retainedMedia.includes(media.media_url)
    );
    if (mediaToDelete.length > 0) {
        try {
            await Promise.all(mediaToDelete.map(media =>
                deleteFromCloudinaryByUrl(media.media_url)
            ));
            await deleteNewsMediaByUrls(mediaToDelete.map(m => m.media_url));
        } catch (error) {
            console.error("Gagal menghapus media lama:", error.message);
            throw new ApiError(500, "Gagal menghapus media lama!");
        }
    }

    
    let uploadedUrl = [];

    if (mediaFiles.length > 0) {
        try {
            // Upload media baru ke Cloudinary secara paralel
            const uploadPromises = mediaFiles.map(file =>
                uploadToCloudinary(file.buffer, file.originalname).then(url => {
                    const type = file.mimetype.startsWith('video') ? 'video' : 'image';
                    return addNewsMedia(id, url, type, false).then(() => ({
                        media_url: url,
                        media_type: type,
                        isThumbnail: false
                    }));
                })
            );
            uploadedUrl = await Promise.all(uploadPromises);  // Upload media baru secara paralel

        } catch (error) {
            console.error("Gagal upload atau simpan media baru:", error.message);
            throw new ApiError(500, "Gagal upload atau menyimpan media baru!");
        }
    } 
    const finalMedia = [
        ...existingNews.filter(m => m.isThumbnail || retainedMedia.includes(m.media_url)),
        ...uploadedUrl
    ];

    return {
        ...updatedNews,
        newsMedia: finalMedia
    };
};



const removeNews = async (id) => {
    const existingNews = await getNewsByIdData(id);
    if (!existingNews) {
        throw new Error("*Berita tidak ditemukan!");
    }
    // Hapus semua media dari Cloudinary berdasarkan URL
    if (existingNews.newsMedia && existingNews.newsMedia.length > 0) {
        await Promise.all(
            existingNews.newsMedia.map(media => {
                const publicId = extractPublicId(media.media_url); // pastikan fungsi ini ada
                return deleteFromCloudinaryByUrl(media.media_url, publicId);
            })
        );
    }
    // Hapus berita dari database
    const newsData = await deleteNews(id);

    return newsData;
};

module.exports = { getNews, getNewsById, createNewsWithMedia, postVideoToFacebook, postImagesToFacebook, postImagesToInstagram, updateNews, removeNews };
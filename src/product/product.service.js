// Description: This file contains the product service which is responsible for handling business logic related to products.

const ApiError = require('../utils/apiError');

const { findAllProducts, createNewProduct, createInventory, findProductById, updateDataProduct, updateInventoryStock, deleteProductById, deleteInventoryByProductId } = require('./product.repository');
const { findPartnerById } = require('../partners/partner.repository');
const { uploadToCloudinary } = require('../services/cloudinaryUpload.service');
const { deleteFromCloudinaryByUrl, extractPublicId } = require('../utils/cloudinary');

const getAllProducts = async () => {
    const products = await findAllProducts();
    if (!products || products.length === 0) {
        throw new ApiError(404, 'Produk tidak tidak ada!');
    }
    return products;
}

const getProductById = async (productId) => {
    const product = await findProductById(productId);
    if (!product|| product=== null) {
        throw new ApiError(404, 'Produk tidak ditemukan!');
    }
    return product;
}

const removeProductById = async (idProduct) => {
    const existingProduct = await findProductById(idProduct);
    console.log("produk yang dicari: ", existingProduct)

    if (!existingProduct) {
        throw new ApiError(404, 'Produk tidak ditemukan!');
    }

    if (existingProduct.image) {
        try {
            await deleteFromCloudinaryByUrl(existingProduct.image);
        } catch (error) {
            console.error('Error deleting image from Cloudinary:', error);
            throw new ApiError(500, 'Gagal menghapus gambar produk dari Cloudinary!');
        }
    }

    const productData = await deleteProductById(idProduct);
    if (!productData) {
        throw new ApiError(500, 'Gagal menghapus produk!');
    }
    return productData;
}

const createProduct = async (newProductData) => {
    try {
        const { image, stock, partner_id, ...rest } = newProductData

        if (
            partner_id === null ||
            partner_id === undefined ||
            isNaN(parseInt(partner_id))
        ) {
            throw new ApiError(400, 'Partner ID tidak valid atau tidak boleh kosong!');
        }

        const cleanProductData = {
            ...rest,
            price: parseInt(rest.price),
            partner_id: parseInt(partner_id),
            weight: parseInt(rest.weight),
        };
        const stockProduct = parseInt(stock)

        const partnerExists = await findPartnerById(cleanProductData.partner_id);
        if (!partnerExists) {
            throw new ApiError(404, 'Partner tidak ditemukan!');
        }

        let imageUrl = null;
        if (image) {
            try {
                imageUrl = await uploadToCloudinary(image.buffer, image.originalname);
                console.log('Image URL:', imageUrl);
            } catch (error) {
                console.error('Error uploading image to Cloudinary:', error);
                throw new ApiError(500, 'Gagal mengunggah gambar produk!', " " + (error.message || error));

            }
        }

        const productNewData = await createNewProduct(
            {
                ...cleanProductData,
                image: imageUrl
            });
        if (!productNewData) {
            throw new ApiError(500, 'Gagal menambahkan produk!');
        }
        const inventoryData = {
            products_id: productNewData.id,
            stock: stockProduct
        };
        await createInventory(inventoryData);
        return productNewData;
    } catch (error) {
        console.error('Error in createProduct:', error);
        throw new ApiError(500, (error.message || error));
    }
}

const updateProduct = async (id, updatedProductData) => {
    try {
        if (isNaN(parseInt(id))) {
            throw new ApiError(400, 'ID produk tidak valid!');
        }
        
        const product = await findProductById(id);
        if (!product) {
            throw new ApiError(404, 'Produk tidak ditemukan!');
        }

        const { productFile, stock, ...rest } = updatedProductData
        console.log('productFile:', productFile);

        const cleanProductData = {
            ...rest,
            ...(rest.weight !== undefined && {weight: parseInt(rest.weight)}),
            ...(rest.price !== undefined && {price: parseInt(rest.price)}),
            ...(rest.partner_id !== undefined && {partner_id: parseInt(rest.partner_id)}),
        };

        if (cleanProductData.partner_id) {
            const partnerExists = await findPartnerById(cleanProductData.partner_id);
            if (!partnerExists) {
                throw new ApiError(404, 'Partner tidak ditemukan!');
            }
        }

        if (productFile && productFile.buffer && productFile.originalname) {
            if (product.image) {
                try {
                    await deleteFromCloudinaryByUrl(product.image);
                } catch (error) {
                    console.error('Error deleting image from Cloudinary:', error);
                    throw new ApiError(500, 'Gagal menghapus gambar produk dari Cloudinary!', " " + (error.message || error));
                }
            }
            try {
                const imageUrl = await uploadToCloudinary(productFile.buffer, productFile.originalname);
                cleanProductData.image = imageUrl;
            } catch (error) {
                console.error('Error uploading image to Cloudinary:', error);
                throw new ApiError(500, 'Gagal mengunggah gambar produk!', " " + (error.message || error));

            }
        } else {
            cleanProductData.image = product.image;
        }

        const updatedProduct = await updateDataProduct(id, cleanProductData);

        if (stock !== undefined) {
            const parsedStock = parseInt(stock);
            await updateInventoryStock({
                products_id: updatedProduct.id,
                stock: parsedStock,
            });
        }

        return updatedProduct;
    } catch (error) {
        console.error('Error in updateProduct:', error);
        throw new ApiError(500, 'Terjadi kesalahan saat memperbarui produk.' + (error.message || error));
    }
}

module.exports = { getAllProducts, createProduct, updateProduct, getProductById, removeProductById };
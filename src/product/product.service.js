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
    if (!product) {
        throw new ApiError(404, 'Produk tidak ditemukan!');
    }
    return product;
}

const removeProductById = async (id) => {
    const existingProduct = await findProductById(id);
    if (!existingProduct) {
        throw new ApiError(404, 'Produk tidak ditemukan!');
    }

    // await deleteInventoryByProductId(id);

    const productData = await deleteProductById(id);
    if (!productData) {
        throw new ApiError(500, 'Gagal menghapus produk!');
    }
    return productData;
}

const createProduct = async (newProductData) => {
    try {
        const{image,stock,...rest}=newProductData
        const cleanProductData = {
            ...rest,
            price: parseInt(rest.price),
            partner_id: parseInt(rest.partner_id),
        };
        const stockProduct = parseInt(stock)

        const partnerExists = await findPartnerById(cleanProductData.partner_id);
        if (!partnerExists) {
            throw new ApiError(404, 'Partner tidak ditemukan!');
        }

        let imageUrl = null;
        if(image){
            try {
                imageUrl = await uploadToCloudinary(image.buffer, image.originalname);
            } catch (error) {
                console.error('Error uploading image to Cloudinary:', error);
                throw new ApiError(500, 'Gagal mengunggah gambar produk!'," "+ (error.message || error));
                
            }
        }

        const productNewData = await createNewProduct(cleanProductData, imageUrl);
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
        throw new ApiError(500, 'Terjadi kesalahan saat menambahkan produk.' + (error.message || error));
    }
}

const updateProduct = async (id, updatedProductData) => {
    try {
        const product = await findProductById(id);
        if (!product) {
            throw new ApiError(404, 'Produk tidak ditemukan!');
        }

        const cleanProductData = {
            ...updatedProductData,
            price: updatedProductData.price !== undefined ? parseInt(updatedProductData.price) : undefined,
            partner_id: updatedProductData.partner_id !== undefined ? parseInt(updatedProductData.partner_id) : undefined,
        };
        delete cleanProductData.stock;

        if (cleanProductData.partner_id) {
            const partnerExists = await findPartnerById(cleanProductData.partner_id);
            if (!partnerExists) {
                throw new ApiError(404, 'Partner tidak ditemukan!');
            }
        }

        const updatedProduct = await updateDataProduct(id, cleanProductData);

        if (updatedProductData.stock !== undefined) {
            const stock = parseInt(updatedProductData.stock);
            await updateInventoryStock({
                products_id: updatedProduct.id,
                stock: stock,
            });
        }

        return updatedProduct;
    } catch (error) {
        console.error('Error in updateProduct:', error);
        throw new ApiError(500, 'Terjadi kesalahan saat memperbarui produk.' + (error.message || error));
    }
}

module.exports = { getAllProducts, createProduct, updateProduct, getProductById, removeProductById };
const ApiError = require('../utils/apiError');

const { VissionMission } = require("@prisma/client")
const { uploadToCloudinary } = require('../services/cloudinaryUpload.service');
const { deleteFromCloudinaryByUrl, extractPublicId } = require('../utils/cloudinary');
const {
    createNewCompany, getDataCompanies, updateCompanyById, findCompanyById
} = require('./company.repository');
const { get } = require('./company.controller');

const createCompany = async (newCompanyData) => {

    const { image, ...rest } = newCompanyData;

    let imageUrl = null;
    // Jika ada file gambar yang di-upload
    if (image) {
        try {
            // Upload ke Cloudinary dan dapatkan URL-nya
            imageUrl = await uploadToCloudinary(image.buffer, image.originalname);
            console.log('Image URL from Cloudinary:', imageUrl);
        } catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
            throw new ApiError(500, 'Gagal mengunggah gambar!');
        }
    }

    // Gabungkan data teks dengan URL gambar
    const companyDataToCreate = {
        ...rest,
        image: imageUrl,
    };
    console.log('Company data to create:', companyDataToCreate);

    // Panggil repository untuk menyimpan ke database
    const company = await createNewCompany(companyDataToCreate);

    if (!company) {
        throw new ApiError(500, 'Gagal menambahkan data company!');
    }

    return company;

};

const getAllCompanies = async () => {
    try {
        // Panggil repository untuk mendapatkan semua data company
        const companies = await getDataCompanies();

        if (!companies || companies.length === 0) {
            throw new ApiError(404, 'Tidak ada data perusahaan ditemukan!');
        }

        return companies;
    } catch (error) {
        // Tangani error dan lempar sebagai ApiError agar bisa ditangkap di controller
        console.error('Error in getAllCompanies service:', error);
        throw new ApiError(error.statusCode || 500, error.message || 'Terjadi kesalahan di server!');
    }
};

const updateCompany = async (companyId, newData) => {

    // 1. Cek apakah data perusahaan ada di database
    const existingCompany = await findCompanyById(companyId);
    if (!existingCompany) {
        throw new ApiError(404, 'Data perusahaan tidak ditemukan!');
    }

    const { image: newImageFile, ...rest } = newData;
    let newImageUrl = existingCompany.image; // Secara default, gunakan URL gambar yang lama

    // 2. Jika ada file gambar baru yang diunggah
    if (newImageFile) {
        try {
            // Upload gambar baru ke Cloudinary
            newImageUrl = await uploadToCloudinary(newImageFile.buffer, newImageFile.originalname);
            console.log('New Image URL from Cloudinary:', newImageUrl);

            // Hapus gambar lama dari Cloudinary jika ada
            if (existingCompany.image) {
                await deleteFromCloudinaryByUrl(existingCompany.image);
                console.log('Old image deleted from Cloudinary:', existingCompany.image);
            }
        } catch (error) {
            console.error('Error handling image update:', error);
            throw new ApiError(500, 'Gagal memproses gambar!');
        }
    }

    // 3. Siapkan data final untuk dikirim ke repository
    const dataToUpdate = {
        ...rest,
        image: newImageUrl,
    };

    // 4. Panggil repository untuk memperbarui data di database
    const updatedCompany = await updateCompanyById(companyId, dataToUpdate);
    return updatedCompany;

}

const getCompanyById = async (companyId) => {
    const company = await findCompanyById(companyId);

    // Jika data tidak ditemukan, lempar error 404
    if (!company) {
        throw new ApiError(404, 'Data perusahaan tidak ditemukan!');
    }

    return company;
};

const getVissionMissionData = () => {
    return Object.values(VissionMission);
};

module.exports = {
    createCompany, getAllCompanies, updateCompany, getCompanyById, getVissionMissionData
};
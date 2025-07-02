const prisma = require("../db")

const createNewCompany = async (companyData) => {
    const {
        titleCompany,
        descCompany,
        image,
        descVisi,
        descMisi,
    } = companyData;

    // Menggunakan transaksi untuk memastikan integritas data
    const result = await prisma.$transaction(async (tx) => {
        // 1. Membuat entri utama di tabel AboutCompany
        const aboutCompany = await tx.aboutCompany.create({
            data: {
                title: titleCompany,
                description: descCompany,
                image: image, // URL gambar dari Cloudinary
            },
        });

        // 2. Membuat entri untuk Visi di tabel AboutVisionMission
        await tx.aboutVisionMission.create({
            data: {
                title: 'VISI',
                description: descVisi,
                about_id: aboutCompany.id, // Menghubungkan ke AboutCompany yang baru dibuat
            },
        });

        // 3. Membuat entri untuk Misi di tabel AboutVisionMission
        await tx.aboutVisionMission.create({
            data: {
                title: 'MISI',
                description: descMisi,
                about_id: aboutCompany.id, // Menghubungkan ke AboutCompany yang sama
            },
        });

        // Mengambil kembali data yang baru dibuat beserta relasinya untuk dikembalikan
        const newCompanyWithRelations = await tx.aboutCompany.findUnique({
            where: { id: aboutCompany.id },
            include: {
                visionMission: true, // Sertakan data visi dan misi
            }
        });

        return newCompanyWithRelations;
    });

    return result;
}

const findCompanyById = async (id) => {
    const company = await prisma.aboutCompany.findUnique({
        where: { id: parseInt(id) },
        include: {
            visionMission: true,
        },
    });
    return company;
};


// src/company/company.repository.js

const updateCompanyById = async (id, companyData) => {
    const {
        titleCompany,
        descCompany,
        image,
        descVisi,
        descMisi,
    } = companyData; 

    const result = await prisma.$transaction(async (tx) => {
        // 1. Update data utama di tabel AboutCompany
        await tx.aboutCompany.update({
            where: { id: parseInt(id) },
            data: {
                title: titleCompany,
                description: descCompany,
                ...(image && { image: image }),
            },
        });

        // 2. Update data Visi berdasarkan relasi dan tipe
        if (descVisi) {
            await tx.aboutVisionMission.updateMany({
                where: {
                    about_id: parseInt(id),
                    title: 'VISI', // Targetkan record dengan tipe 'VISI'
                },
                data: {
                    description: descVisi,
                },
            });
        }

        // 3. Update data Misi berdasarkan relasi dan tipe
        if (descMisi) {
            await tx.aboutVisionMission.updateMany({
                where: {
                    about_id: parseInt(id),
                    title: 'MISI', // Targetkan record dengan tipe 'MISI'
                },
                data: {
                    description: descMisi,
                },
            });
        }

        // Ambil kembali data terbaru untuk dikembalikan
        return tx.aboutCompany.findUnique({
            where: { id: parseInt(id) },
            include: {
                visionMission: true,
            },
        });
    });

    return result;
};

const getDataCompanies = async () => {
    const companies = await prisma.aboutCompany.findMany({
        include: {
            visionMission: true, 
        },
    });
    return companies;
};

module.exports = {
    createNewCompany, updateCompanyById, findCompanyById, getDataCompanies
}
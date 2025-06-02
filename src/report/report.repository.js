const prisma = require('../db');

const addFormTemplate = async ({ title, google_form_link }) => {
    const formTemplate = await prisma.formTemplate.create({
        data: {
            title,
            google_form_link,
        },
    });

    return formTemplate;
}

module.exports = { addFormTemplate };
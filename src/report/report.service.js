const ApiError = require("../utils/apiError");

const { addFormTemplate } = require("./report.repository");

const createFormTemplate = async ({ title, google_form_link }) => {
    if (!title || !google_form_link) {
        throw new ApiError(400, "Judul dan link form harus diisi");
    }

    const createFormTemplate = await addFormTemplate({ title, google_form_link });
    if (!createFormTemplate) {
        throw new ApiError(500, "Gagal membuat template form");
    }

    return createFormTemplate;
}

module.exports = { createFormTemplate };
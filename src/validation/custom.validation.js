const validator = require('validator');

const isValidEmail = (value) => {
    if (!validator.isEmail(value)) {
        throw new Error('*Format email tidak valid');
    }
    return true;
};

const isValidPhoneNumber = (value) => {
    if (!validator.isMobilePhone(value, 'id-ID')) {
        throw new Error('*Format nomor telepon tidak valid');
    }
    if (!validator.isNumeric(value)) {
        throw new Error('*Nomor telepon harus berupa angka');
    }
    if (value.length < 10 || value.length > 15) {
        throw new Error('*Nomor telepon harus 10–15 digit');
    }
    return true;
};

module.exports = {
    isValidEmail,
    isValidPhoneNumber,
};

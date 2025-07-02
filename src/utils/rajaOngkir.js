const axios = require('axios');

const rajaOngkirApi = axios.create({
    baseURL: 'https://rajaongkir.komerce.id/api/v1',
    headers: {
        key: process.env.RAJAONGKIR_API_KEY,
    },
});
const rajaOngkirApiKomship = axios.create({
    baseURL: 'https://rajaongkir.komerce.id/api/v1',
    headers: {
        key: process.env.RAJAONGKIR_API_KEY,
    },
});

module.exports = rajaOngkirApi;

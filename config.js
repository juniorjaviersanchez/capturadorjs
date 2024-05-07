require('dotenv').config();
const axios = require('axios');

// Crea una instacia de axios con url base
const laravelAPI = axios.create({
    baseURL: `${process.env.LARAVEL_PROTOCOL}://${process.env.LARAVEL_HOST}:${process.env.LARAVEL_PORT}/api/`,
    timeout: 300000
});


// Crea una instacia de axios con url base
const plataformaAPI = axios.create({
    baseURL: `${process.env.PLATAFORMA_PROTOCOL}://${process.env.PLATAFORMA_HOST}:${process.env.PLATAFORMA_PORT}/api/`,
    timeout: 300000
});


module.exports = {
    laravelAPI,
    plataformaAPI
}
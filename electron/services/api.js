const axios = require('axios');

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
});

module.exports = api;

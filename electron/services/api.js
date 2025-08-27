const axios = require('axios');

const api = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:3000/api',
});

module.exports = api;

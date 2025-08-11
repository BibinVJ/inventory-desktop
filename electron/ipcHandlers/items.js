const api = require('../services/api');

const getItems = async () => {
  const response = await api.get('/item?unpaginated=1');
  return response.data.results;
};

const getItem = async (id) => {
    const response = await api.get(`/item/${id}`);
    return response.data.results;
};

module.exports = {
  getItems,
  getItem,
};

const api = require('../services/api');

const getCustomers = async () => {
  const response = await api.get('/customer?unpaginated=1');
  return response.data.results;
};

module.exports = {
  getCustomers,
};

const api = require('../services/api');

const getNextInvoiceNumber = async () => {
    const response = await api.get('/sale/next-invoice-number');
    return response.data.results;
};

const addSale = async (sale) => {
    const response = await api.post('/sale', sale);
    return response.data;
};

const getSales = async () => {
    const response = await api.get('/sale');
    return response.data.results;
};

module.exports = {
  getNextInvoiceNumber,
  addSale,
  getSales,
};

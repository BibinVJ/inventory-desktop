const api = require('../services/api');
const Store = require('electron-store');

const store = new Store();

const login = async (identifier, password) => {
  const formData = new FormData();
  formData.append('identifier', identifier);
  formData.append('password', password);

  const response = await api.post('/login', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const logout = () => {
  store.delete('token');
  delete api.defaults.headers.common['Authorization'];
};

const storeToken = (token) => {
  store.set('token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

const getToken = () => {
  return store.get('token');
};

module.exports = {
  login,
  logout,
  storeToken,
  getToken,
};

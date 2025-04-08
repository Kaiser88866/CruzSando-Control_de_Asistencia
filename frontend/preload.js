const { contextBridge } = require('electron');
const axios = require('axios');

contextBridge.exposeInMainWorld('api', {
    get: (url) => axios.get(`http://localhost:8000/api/${url}`),
    post: (url, data) => axios.post(`http://localhost:8000/api/${url}`, data),
});

const { contextBridge } = require('electron');
const axios = require('axios');

contextBridge.exposeInMainWorld('api', {
    get: (url) => axios.get(`http://localhost:9500/api/${url}`),
    post: (url, data) => axios.post(`http://localhost:9500/api/${url}`, data),
    put: (url, data) => axios.put(`http://localhost:9500/api/${url}`, data),
    delete: (url) => axios.delete(`http://localhost:9500/api/${url}`),
});

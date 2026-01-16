import axios from 'axios';

const request = axios.create({
  baseURL: 'https://v3pz.itndedu.com/v3pz',
  timeout: 10000
});

// 添加拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pz_token');
    const whiteUrl = ['/get/code', '/user/authentication', '/login'];

    if (token && !whiteUrl.includes(config.url || '')) {
      config.headers['X-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    if (response.data.code === -1) {
      alert(response.data.message);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default request;
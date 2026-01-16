import axios from 'axios';

const baseURL = 'https://v3pz.itndedu.com/v3pz';

export const api = axios.create({
  baseURL,
  timeout: 10000
});

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pz_token');
  const noTokenUrls = ['/user/authentication', '/login','/get/code'];
  
  const needsToken = !noTokenUrls.some(url => config.url?.includes(url));
  
  if (token && needsToken) {
    config.headers['token'] = token;
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['x-token'] = token;
  } else {
    delete config.headers['token'];
    delete config.headers['Authorization'];
    delete config.headers['X-token'];
  }
  
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.code === -2) {
      localStorage.removeItem('pz_token');
      localStorage.removeItem('pz_user');
    }
    return Promise.reject(error);
  }
);
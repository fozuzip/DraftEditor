import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;
const ybitApiUrl = process.env.REACT_APP_YBIT_API_URL;
const token = window.location.pathname.replace('/notes/', '');

axios.defaults.headers.common.Authorization = `Bearer ${token}`;

export default axios.create({
  baseURL: apiUrl
});

export const ybitApiService = axios.create({
  baseURL: ybitApiUrl
});

import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const baseUrl = `http://${backendUrl}`;

const api = axios.create({
    baseURL: baseUrl
})

export default api;
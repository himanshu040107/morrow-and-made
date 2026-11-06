import axios from "axios";

const api=axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV
        ? "http://localhost:3000/api"
        : "https://morrow-and-made.onrender.com/api"),
    withCredentials: true,
})

api.interceptors.request.use((config) => {
    const token = window.__marketAccessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
})

export default api;

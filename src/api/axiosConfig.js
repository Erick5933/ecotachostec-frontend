import axios from "axios";

// Base de API:
// - Desarrollo: usamos el proxy de Vite (/api) para evitar CORS
// - Producción: apuntamos por defecto al dominio en la nube
const API_URL = import.meta.env.DEV
  ? "/api"
  : (import.meta.env.VITE_API_URL || "https://ecotachoste.me/api");

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// TOKEN
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;

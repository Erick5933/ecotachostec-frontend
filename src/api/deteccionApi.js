import axios from "./axiosConfig";

export const getDetecciones = () => axios.get("/detecciones/");
export const getDeteccionById = (id) => axios.get(`/detecciones/${id}/`);
export const createDeteccion = (data) => axios.post("/detecciones/", data);
export const updateDeteccion = (id, data) => axios.put(`/detecciones/${id}/`, data);
export const deleteDeteccion = (id) => axios.delete(`/detecciones/${id}/`);

import axios from "./axiosConfig";

export const getProvincias = () => axios.get("/provincias/");
export const getCiudades = () => axios.get("/ciudades/");
export const getCantones = () => axios.get("/cantones/");

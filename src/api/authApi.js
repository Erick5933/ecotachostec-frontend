// src/api/authApi.js
import axios from "./axiosConfig";

export const login = (credentials) => axios.post("/usuarios/auth/login/", credentials);

export const register = (userData) => axios.post("/usuarios/auth/register/", userData);

export const getProfile = () => axios.get("/usuarios/auth/profile/");

export const updateProfile = (data) => axios.put("/auth/profile/", data);

export const logout = () => axios.post("/auth/logout/");
import axios from "./axiosConfig";

export const login = (data) => axios.post("/auth/login/", data);
export const register = (data) => axios.post("/auth/register/", data);
export const getProfile = () => axios.get("/auth/profile/");

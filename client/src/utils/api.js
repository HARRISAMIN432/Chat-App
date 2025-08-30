import axios from "axios";

const API_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const signup = async (data) => {
  const response = await api.post("/auth/signup", data);
  return response.data;
};

export const signin = async (data) => {
  const response = await api.post("/auth/signin", data);
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put("/users/profile", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const searchUsers = async (query) => {
  const response = await api.get(`/users/search?query=${query}`);
  return response.data;
};

export default api;

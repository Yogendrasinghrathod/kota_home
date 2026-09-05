import axios from "axios";
import { auth } from "./firebase.js";

const backendUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);

const api = axios.create({
  baseURL: `${backendUrl}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
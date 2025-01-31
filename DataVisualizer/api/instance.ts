import useAuthStore from "@/stores/auth";
import axios from "axios";
const BASE_URL = `${process.env.EXPO_PUBLIC_API}/api/v1`;

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (!config.headers.Authorization && !!token) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

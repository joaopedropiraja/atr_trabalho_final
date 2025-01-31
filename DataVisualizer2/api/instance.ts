import axios from "axios";
const BASE_URL = `${process.env.EXPO_PUBLIC_API}/api/v1`;

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// api.interceptors.request.use(
//   (config) => {
//     const { auth } = useAuthStore.getState();
//     if (!config.headers.Authorization && auth?.accessToken) {
//       // eslint-disable-next-line no-param-reassign
//       config.headers.Authorization = `Bearer ${auth.accessToken}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

import axios, { AxiosResponse } from "axios";
import configs from "../../configs";

export type Response<T> = AxiosResponse<T>;

export interface ResponseData<T = unknown> {
  code: number;
  message: string;
  data?: T;
  time: number;
}

// create axios instance
const axiosInstance = axios.create({
  baseURL: configs.SERVER_HOST,
  timeout: 20000,
  withCredentials: true,
});

// config interceptors
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default axiosInstance;

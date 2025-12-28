import axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    // Accept: "application/json",
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Better Auth uses cookies for authentication, no need for manual token handling
    // The withCredentials: true setting will automatically send cookies

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Implement response handling here

    return response;
  },
  (error) => {
    // Implement error handling here
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log("Unauthorized request");
    }
    return Promise.reject(error);
  }
);

export default api;

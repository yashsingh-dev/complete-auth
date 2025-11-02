import axios from "axios";
import { refreshAccessToken } from '../store/useAuthStore';
import { API } from "../config/api";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_HOST + API.API_PREFIX,
    withCredentials: true
});

axiosInstance.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response) {
            const { status, data } = error.response;
            console.log("Axios Status: ", status);
            console.log("Axios Response: ", data);
            if (
                status === 401 &&
                (data.message === 'token_expired_please_login_again' ||
                    data.message === 'access_token_missing')
            ) {
                try {
                    await refreshAccessToken();
                    return axiosInstance(error.config);
                } catch (refreshError) {
                    console.log('Refresh token failed', refreshError);
                    return Promise.reject(refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
)


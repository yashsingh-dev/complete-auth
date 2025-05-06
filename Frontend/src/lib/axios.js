import axios from "axios";
import toast from "react-hot-toast";
import { refreshAccessToken } from '../store/useAuthStore';

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_HOST,
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
            console.log("Status: ",status);
            console.log("Data: ",data);
            if (
                status === 401 &&
                (data.message === 'Token expired, please login again' ||
                    data.message === 'Access token missing')
            ) {
                try {
                    await refreshAccessToken();
                    return axiosInstance(error.config);
                } catch (refreshError) {
                    console.log('Refresh token failed', refreshError);
                    toast.error('Session expired. Please log in again.');
                    return Promise.reject(refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
)


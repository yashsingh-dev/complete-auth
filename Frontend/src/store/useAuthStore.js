import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { Api } from "../config/api";
import toast from "react-hot-toast";
import { Constants } from "../config/constants";

export const useAuthStore = create((set, get) => ({
    user: null,
    setUser: (userData) => set({ user: userData }),
    isLoading: false,
    isCheckingAuth: true,
    expiryIntervalRef: null,
    isAccessProtectedRoute: false,
    setAccessProtectedRoute: (value) => set({ isAccessProtectedRoute: value }),


    checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
            const response = await axiosInstance.get(Api.CHECK_USER);
            console.log("CheckAuth: ", response);
            get().setUser(response.data);
        } catch (error) {
            console.log("CheckAuth Error: ", error);
            if (error.response) {
                get().setUser(null);
                if (error.response.status === 429) {
                    return toast.error("Too many Attempts! Try after some time");
                } else if (error.response.status === 500) {
                    toast.error(Constants.something_went_wrong);
                }
            }
            else {
                toast.error("Network error, please try again later");
            }
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            let response = await axiosInstance.get(Api.LOGOUT);
            console.log("Logout: ", response);
            get().setUser(null);
            toast.success("Logged out successfully");
        } catch (error) {
            console.log("Logout Error: ", error);
            if (error.response) {
                toast.error(Constants.something_went_wrong);
            }
            else {
                toast.error("Network error, please try again later.");
            }
        } finally {
            set({ isLoading: false });
        }
    },

    refreshAccessToken: async () => {
        try {
            const response = await axiosInstance.get(Api.REFRESH_TOKEN);
            console.log("Refresh Token: ", response);
            const currentUser = get().user;
            set({ user: { ...currentUser, tokenExp: response.data.tokenExp } });
        } catch (error) {
            console.log("Refresh Token Error", error);
            if (error.response) {
                if (error.response.status === 401) {
                    console.log("Refresh token missing");
                    toast.error('Session expired, please log in again');
                }
                else if (error.response.status === 429) {
                    toast.error("Too many Attempts! Try after some time");
                }
            }
            else {
                toast.error("Network error, please try again later.");
            }
            get().stopTokenExpiryMonitor();
            set({ user: null });
        }
    },

    startTokenExpiryMonitor: () => {
        let accessTokenExpiry = get().user?.tokenExp;
        if (!accessTokenExpiry) return;

        const interval = setInterval(() => {
            let remainTime = (accessTokenExpiry - Date.now()) / 1000;

            // console.log("remainTime: ", remainTime);
            if (remainTime <= 60) {
                clearInterval(get().expiryIntervalRef);
                get().refreshAccessToken();
            }
        }, 2000);

        set({ expiryIntervalRef: interval });
    },

    stopTokenExpiryMonitor: () => {
        const { expiryIntervalRef } = get();
        if (expiryIntervalRef) {
            clearInterval(expiryIntervalRef);
            set({ expiryIntervalRef: null });
        }
    }

}));

export const refreshAccessToken = useAuthStore.getState().refreshAccessToken;
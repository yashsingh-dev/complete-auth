import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { Api } from "../config/api";
import toast from "react-hot-toast";
import { Constants } from "../config/constants";
import { handleApiError } from "../utils/handleApiError";

export const useAuthStore = create((set, get) => ({
    user: null,
    setUser: (userData) => set({ user: userData }),
    loader: false,
    isLoading: false,
    isCheckingAuth: true,
    expiryIntervalRef: null,

    checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
            const response = await axiosInstance.get(Api.CHECK_USER);
            console.log("CheckAuth: ", response);
            if (response.data.success) {
                get().setUser(response.data.payload);
            }
            else {
                get().setUser(null);
                toast.error(Constants.SOMETHING_WENT_WRONG);
            }
        } catch (error) {
            handleApiError("CheckAuth", error, { setUser: get().setUser });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    googleLogin: async (code) => {
        set({ loader: true });
        try {
            const response = await axiosInstance.post(Api.GOOGLE_LOGIN, { code });
            console.log("Google Login: ", response);
            if (response.data.success) {
                get().setUser(response.data.payload);
                toast.success(Constants.LOGGED_IN_SUCCESS);
                return true;
            }
            else {
                get().setUser(null);
                toast.error(Constants.SOMETHING_WENT_WRONG);
            }
            return false;
        } catch (error) {
            handleApiError("googleLogin", error);
            return false;
        } finally {
            set({ loader: false });
        }
    },

    googleOneTapLogin: async (credentialResponse) => {
        set({ loader: true });
        try {
            const response = await axiosInstance.post(Api.GOOGLE_ONE_TAP_LOGIN, {
                token: credentialResponse.credential,
            });
            console.log("Google One Tap: ", response);
            if (response.data.success) {
                get().setUser(response.data.payload);
                toast.success(Constants.LOGGED_IN_SUCCESS);
                return true;
            }
            else {
                get().setUser(null);
                toast.error(Constants.SOMETHING_WENT_WRONG);
            }
            return false;
        } catch (error) {
            handleApiError("googleOneTapLogin", error);
            return false;
        } finally {
            set({ loader: false });
        }
    },

    login: async (email, password, rememberMe) => {
        set({ loader: true });
        try {
            const response = await axiosInstance.post(Api.LOGIN, { email, password, rememberMe });
            console.log("Login: ", response);
            if (response.data.success) {
                get().setUser(response.data.payload);
                toast.success(Constants.LOGGED_IN_SUCCESS);
                return true;
            }
            else {
                get().setUser(null);
                toast.error(Constants.SOMETHING_WENT_WRONG);
            }
            return false;
        } catch (error) {
            handleApiError("Login", error);
            return false;
        } finally {
            set({ loader: false });
        }
    },

    signup: async (fullname, email, password) => {
        set({ loader: true });
        try {
            const response = await axiosInstance.post(Api.SIGNUP, { fullname, email, password });
            console.log("Signup: ", response);
            if (response.data.success) {
                get().setUser(response.data.payload);
                toast.success(Constants.SIGNUP_IN_SUCCESS);
                return true;
            }
            else {
                get().setUser(null);
                toast.error(Constants.SOMETHING_WENT_WRONG);
            }
            return false;
        } catch (error) {
            handleApiError("Signup", error);
            return false;
        } finally {
            set({ loader: false });
        }
    },

    forgetPass: async (email) => {
        set({ loader: true });
        try {
            const response = await axiosInstance.post(Api.FORGET_PASSWORD, { email });
            console.log("Forget Pass : ", response);
            if (response.data.success) {
                toast.success(Constants.EMAIL_SENT_SUCCESS);
                return true;
            }
            else {
                toast.error(Constants.SOMETHING_WENT_WRONG);
            }
            return false;
        } catch (error) {
            handleApiError("Forget Pass", error);
            return false;
        } finally {
            set({ loader: false });
        }
    },

    resetPass: async (token, password) => {
        set({ loader: true });
        try {
            const response = await axiosInstance.post(Api.RESET_PASSWORD, { token, password });
            console.log("Reset Pass : ", response);
            if (response.data.success) {
                toast.success(Constants.PASSWORD_RESET_SUCCESS);
                return true;
            }
            else {
                toast.error(Constants.SOMETHING_WENT_WRONG);
            }
            return false;
        } catch (error) {
            handleApiError("Reset Pass", error);
            return false;
        } finally {
            set({ loader: false });
        }
    },

    verifyEmail: async (token, code) => {
        set({ loader: true });
        try {
            const response = await axiosInstance.post(Api.VERIFY_EMAIL, { token, code });
            console.log("verifyEmail: ", response);
            if (response.data.success) {
                get().setUser(response.data.payload);
                toast.success(Constants.EMAIL_VERIFIED_SUCCESS);
                return true;
            }
            else {
                toast.error(Constants.SOMETHING_WENT_WRONG);
            }
            return false;
        } catch (error) {
            handleApiError("Verify Email", error);
            return false;
        } finally {
            set({ loader: false });
        }
    },

    sendVerifyEmailOTP: async () => {
        set({ loader: true });
        try {
            const response = await axiosInstance.get(Api.SEND_EMAIL_OTP); ``
            console.log("sendVerifyEmailOTP: ", response);
            if (response.data.success) {
                toast.success(Constants.OTP_SENT_SUCCESS);
                return response.data.payload.token;
            }
            else {
                toast.error(Constants.SOMETHING_WENT_WRONG);
            }
            return false;
        } catch (error) {
            handleApiError("Send Verify Email OTP", error, { setUser: get().setUser });
            return false;
        } finally {
            set({ loader: false });
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            let response = await axiosInstance.get(Api.LOGOUT);
            console.log("Logout: ", response);
            if (response.data.success) {
                get().setUser(null);
                toast.success(Constants.LOGOUT_SUCCESS);
            }
            else {
                toast.error(Constants.SOMETHING_WENT_WRONG);
            }
        } catch (error) {
            handleApiError("Logout", error, { setUser: get().setUser });
        } finally {
            set({ isLoading: false });
        }
    },

    refreshAccessToken: async () => {
        try {
            const response = await axiosInstance.get(Api.REFRESH_TOKEN);
            console.log("Refresh Token: ", response);
            if (response.data.success) {
                const currentUser = get().user;
                set({ user: { ...currentUser, tokenExp: response.data.payload.tokenExp } });
            }
            else {
                toast.error(Constants.SOMETHING_WENT_WRONG);
            }
        } catch (error) {
            handleApiError("Refresh Token", error, { setUser: get().setUser });
            get().stopTokenExpiryMonitor();
            throw error;
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
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import { Api } from "../config/api";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { Constants } from "../config/constants";

export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const { setUser } = useAuthStore();

    const login = async (email, password, rememberMe) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post(Api.LOGIN, { email, password, rememberMe });
            console.log("Login: ", response);
            setUser(response.data);
            toast.success("Logged in successfully");
            return true;
        } catch (error) {
            console.log("Login Error", error);
            if (error.response) {
                if (error.response.status === 401) {
                    toast.error("Invalid email or password");
                }
                else if (error.response.status === 429) {
                    toast.error("Too many Login Attempts! Try after some time");
                }
                else {
                    toast.error(Constants.something_went_wrong);
                }
            }
            else {
                toast.error("Network error, please try again later.");
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { login, loading };
};

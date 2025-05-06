import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import { Api } from "../config/api";
import toast from "react-hot-toast";
import { Constants } from "../config/constants";
import { useAuthStore } from "../store/useAuthStore";

export const useForgetPass = () => {
    const [loading, setLoading] = useState(false);
    const { setAccessProtectedRoute } = useAuthStore();

    const forgetPass = async (email) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post(Api.FORGET_PASSWORD, { email });
            console.log("Forget Pass : ", response);
            setAccessProtectedRoute(true);
            toast.success("Email sent successfully");
            return true;
        } catch (error) {
            console.log("Forget Pass: ", error);
            if (error.response) {
                if (error.response.status === 401) {
                    toast.error("User not found");
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

    return { forgetPass, loading };
};

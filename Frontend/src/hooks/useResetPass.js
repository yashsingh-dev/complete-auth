import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import { Api } from "../config/api";
import toast from "react-hot-toast";
import { Constants } from "../config/constants";
import { useAuthStore } from "../store/useAuthStore";

export const useResetPass = () => {
    const [loading, setLoading] = useState(false);
    const { setAccessProtectedRoute } = useAuthStore();

    const resetPass = async (token, password) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post(Api.RESET_PASSWORD, { token, password });
            console.log("Reset Pass : ", response);
            setAccessProtectedRoute(false);
            toast.success("Password reset successfully");
            return true;
        } catch (error) {
            console.log("Reset Pass: ", error);
            if (error.response) {
                if (error.response.status === 401) {
                    toast.error("Invalid or expired reset token");
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

    return { resetPass, loading };
};

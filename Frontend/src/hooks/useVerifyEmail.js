import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import { Api } from "../config/api";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

export const useVerifyEmail = () => {
    const [loading, setLoading] = useState(false);
    const { setUser, setAccessProtectedRoute } = useAuthStore();

    const verifyEmail = async (code) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post(Api.VERIFY_EMAIL, { code });
            console.log("verifyEmail: ", response);
            setUser(response.data);
            setAccessProtectedRoute(false);
            toast.success("Email Verified Successfully");
            return true;
        } catch (error) {
            console.log("verifyEmail Error: ", error);
            if (error.response) {
                if (error.response?.status === 410) {
                    toast.error("OTP Exipred");
                } else if (error.response?.status == 401) {
                    toast.error("Incorrect OTP");
                } else if (error.response.status === 429) {
                    toast.error("Wait for a min! Try again");
                } else {
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

    return { verifyEmail, loading };
};

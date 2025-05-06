import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import { Api } from "../config/api";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { Constants } from "../config/constants";

export const useSendVerifyEmailOTP = () => {
    const [loading, setLoading] = useState(false);
    const { setAccessProtectedRoute } = useAuthStore();

    const sendVerifyEmailOTP = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(Api.SEND_EMAIL_OTP);
            console.log("sendVerifyEmailOTP: ", response);
            setAccessProtectedRoute(true);
            toast.success("OTP sent successfully");
            return true;
        } catch (error) {
            console.log("sendVerifyEmailOTP Error: ", error);
            if(error.response){
                if (error.response.status === 429) {
                    toast.error("Too many Login Attempts! Try after some time");
                }
                else {
                    toast.error(Constants.something_went_wrong);
                }
            }
            else{
                toast.error("Network error, please try again later.");
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { sendVerifyEmailOTP, loading };
};

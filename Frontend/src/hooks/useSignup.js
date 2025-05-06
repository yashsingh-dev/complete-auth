import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import { Api } from "../config/api";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

export const useSignup = () => {
    const [loading, setLoading] = useState(false);
    const { setUser } = useAuthStore();

    const signup = async (fullname, email, password) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post(Api.SIGNUP, { fullname, email, password });
            console.log("Signup: ", response);
            setUser(response.data);
            toast.success("Signup in successfully");
            return true;
        } catch (error) {
            console.log("Signup Error", error);
            if (error.response) {
                if (error.response.status === 409) {
                    toast.error("User Already exists");
                }
                else if (error.response.status === 429) {
                    toast.error("Too many Signup Attempts! Try after some time");
                }
                else {
                    toast.error("Internal server error");
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

    return { signup, loading };
};

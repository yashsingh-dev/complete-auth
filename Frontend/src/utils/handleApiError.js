import toast from "react-hot-toast";
import { Constants } from "../config/constants";

export const handleApiError = (error, options = {}) => {
    const { setUser } = options;
    console.error("API Error: ", error);

    if (error.response) {
        const { status, data } = error.response;
        console.log("Status: ", status);
        console.log("Data: ", data);
        if (status === 400) {
            if (data.error) {
                (error.response.data?.error[0].schemaPath === '#/properties/email/format') ?
                    toast.error("Invalid email format") : '';
            }
            if (data.message === 'incorrect_otp') {
                toast.error(Constants.INCORRECT_OTP);
            }
            else if (data.message === 'please_login_with_google') {
                toast(Constants.PLEASE_LOGIN_WITH_GOOGLE, { duration: 3000 });
            }
        }
        else if (status === 401) {
            if (data.message === 'session_expired_please_login_again') {
                setUser(null);
                // Redirect to login page
            }
            else if (data.message === 'invalid_email_or_password') {
                toast.error(Constants.INVALID_EMAIL_PASSWORD);
            }
            else if (data.message === 'unauthorized') {
                // Empty
            }
            else if (data.message === 'refresh_token_missing') {
                setUser(null);
                // Redirect to login page
            }
            else if (data.message === 'access_token_missing') {
                // Axios interceptor will take care
            }
            else if (data.message === 'token_expired_please_login_again') {
                // Axios interceptor will take care
            }
        }
        else if (status === 409) {
            if (data.message === 'user_already_exists') {
                toast.error(Constants.USER_ALREADY_EXISTS);
            }
            else if (data.message === 'user_not_found') {
                toast.error(Constants.SOMETHING_WENT_WRONG);
                setUser(null);
                // Something happened to DB or refresh token
            }
        }
        else if (status === 410) {
            if (data.message === 'otp_has_been_expired') {
                toast.error(Constants.OTP_EXPIRED);
                // Redirect to home screen
            }
            else if (data.message === 'link_expired') {
                toast.error(Constants.LINK_EXPIRED);
            }
        }
        else if (status === 404) {
            if (data.message === 'user_not_found') {
                toast.error(Constants.USER_NOT_FOUND);
            }
        }
        else if (status === 403) {
            if (data.message === 'invalid_refresh_token') {
                setUser(null);
                // Redirect to login page
            }
            else if (data.message === 'invalid_token') {
                toast.error(Constants.INVALID_LINK);
            }
            else if (data.message === 'token_has_been_revoked') {
                setUser(null);
                // Hacker Attack
            }
        }
        else if (status === 429) {  
            if (data.message === 'too_many_requests_please_slow_down') {
                toast.error(Constants.TOO_MANY_REQUEST);
            }
            else if (data.message === 'too_many_login_requests_try_after_some_time') {
                toast.error(Constants.TOO_MANY_LOGIN_ATTEMPT);
            }
            else if (data.message === 'too_many_signup_requests_try_after_some_time') {
                toast.error(Constants.TOO_MANY_SIGNUP_ATTEMPT);
            }
        }
        else {
            toast.error(Constants.SOMETHING_WENT_WRONG);
        }
    } else {
        toast.error(Constants.NETWORK_ERROR);
    }
};
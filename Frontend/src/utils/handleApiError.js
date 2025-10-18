import toast from "react-hot-toast";
import { Constants } from "../config/constants";

export const handleApiError = (name, error, options = {}) => {
    const { setUser } = options;
    console.error(`API Error by ${name}: `, error);

    if (error.response) {
        const { status, data } = error.response;
        console.log("ApiError Status: ", status);
        console.log("ApiError Response: ", error.response);
        if (status === 400) {
            if (data.error) {
                (error.response.data?.error[0].schemaPath === '#/properties/email/format') ?
                    toast.error("Invalid email format") : '';
            }
            if (data.error === 'incorrect_otp') {
                toast.error(Constants.INCORRECT_OTP);
            }
            else if (data.error === 'please_login_with_google') {
                toast(Constants.PLEASE_LOGIN_WITH_GOOGLE, { duration: 3000 });
            }
        }
        else if (status === 401) {
            if (data.error === 'session_expired_please_login_again') {
                setUser(null);
                // Redirect to login page
            }
            else if (data.error === 'invalid_email_or_password') {
                toast.error(Constants.INVALID_EMAIL_PASSWORD);
            }
            else if (data.error === 'unauthorized') {
                // Empty
            }
            else if (data.error === 'refresh_token_missing') {
                setUser(null);
                // Redirected to login page
            }
            else if (data.error === 'access_token_missing') {
                // Axios interceptor will take care
            }
            else if (data.error === 'token_expired_please_login_again') {
                // Axios interceptor will take care
            }
        }
        else if (status === 409) {
            if (data.error === 'user_already_exists') {
                toast.error(Constants.USER_ALREADY_EXISTS);
            }
            else if (data.error === 'user_not_found') {
                toast.error(Constants.SOMETHING_WENT_WRONG);
                setUser(null);
                // Redirected to login page
            }
        }
        else if (status === 410) {
            if (data.error === 'otp_has_been_expired') {
                toast.error(Constants.OTP_EXPIRED);
                // Redirect to home screen
            }
            else if (data.error === 'link_expired') {
                toast.error(Constants.LINK_EXPIRED);
            }
        }
        else if (status === 404) {
            if (data.error === 'user_not_found') {
                toast.error(Constants.USER_NOT_FOUND);
            }
        }
        else if (status === 403) {
            if (data.error === 'invalid_refresh_token') {
                setUser(null);
                // Redirected to login page
            }
            else if (data.error === 'invalid_token') {
                toast.error(Constants.INVALID_LINK);
            }
            else if (data.error === 'token_has_been_revoked') {
                setUser(null);
                // Hacker Attack may be
            }
        }
        else if (status === 429) {  
            if (data.error === 'too_many_requests_please_slow_down') {
                toast.error(Constants.TOO_MANY_REQUEST);
            }
            else if (data.error === 'too_many_login_requests_try_after_some_time') {
                toast.error(Constants.TOO_MANY_LOGIN_ATTEMPT);
            }
            else if (data.error === 'too_many_signup_requests_try_after_some_time') {
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
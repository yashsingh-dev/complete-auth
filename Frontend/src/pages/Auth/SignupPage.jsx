import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader, Eye, EyeOff, UserCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import GoogleOneTap from "../../components/GoogleOneTap";
import PasswordStrengthMeter from "../../components/PasswordStrengthMeter";
import toast from "react-hot-toast";
import GoogleButton from "../../components/GoogleButton";
import FacebookButton from "../../components/FacebookButton";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../../store/useAuthStore";
import { Constants } from "../../config/constants";

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, googleLogin, loader } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [passVisible, setPassVisible] = useState(false);

  function validation() {
    if (!name.trim()) {
      toast.error(Constants.NAME_REQUIRED);
      return false;
    } else if (name.trim().length < 3) {
      toast.error(Constants.MIN_LENGTH_NAME);
      return false;
    } else if (!email.trim()) {
      toast.error(Constants.EMAIL_REQUIRED);
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error(Constants.INVALID_EMAIL);
      return false;
    } else if (!password.trim()) {
      toast.error(Constants.PASS_REQUIRED);
      return false;
    } else if (password.trim().length < 6) {
      toast.error(Constants.MIN_LENGTH_PASS);
      return false;
    } else if (passwordStrength == "Weak" || passwordStrength == "Very Weak") {
      toast.error(Constants.CHOOSE_STRONG_PASS);
      return false;
    }
    return true;
  }

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (validation()) {
      const success = await signup(name, email, password);
      success ? navigate("/") : "";
    }
  };

  const responseGoogle = async (authResult) => {
    try {
      await googleLogin(authResult.code);
    } catch (error) {
      console.log("Error while requesting google code: ", error);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  const handleFacebookLogin = () => {
    console.log("Facebook login clicked");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl 
			overflow-hidden"
    >
      <GoogleOneTap />
      <div className="px-8 pt-8 pb-3">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
          Create Account
        </h2>

        <form onSubmit={handleSignUp}>
          {/* Fullname */}
          <div className="relative mt-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <UserCircle className="size-5 text-green-500" />
            </div>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 pl-10 pr-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white transition delay-70"
            />
          </div>

          {/* Email */}
          <div className="relative mt-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="size-5 text-green-500" />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 pl-10 pr-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white transition delay-70"
            />
          </div>

          {/* Password */}
          <div className="relative mt-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="size-5 text-green-500" />
            </div>
            <input
              type={passVisible ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 pl-10 pr-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white transition delay-70"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setPassVisible(!passVisible)}
            >
              {passVisible ? (
                <Eye className="cursor-pointer h-5 w-5 text-base-content/40 text-green-600" />
              ) : (
                <EyeOff className="cursor-pointer h-5 w-5 text-base-content/40 text-green-600" />
              )}
            </button>
          </div>

          {password != "" ? (
            <PasswordStrengthMeter
              password={password}
              setPasswordStrength={setPasswordStrength}
            />
          ) : (
            ""
          )}

          {/* Button */}
          <motion.button
            className={`${
              password != "" ? "mt-5" : "mt-10"
            } w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
						font-bold rounded-lg shadow-lg hover:from-green-600 focus:outline-none transition duration-200 cursor-pointer`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loader}
          >
            {loader ? (
              <Loader className=" animate-spin mx-auto" size={24} />
            ) : (
              "Sign Up"
            )}
          </motion.button>
        </form>
        <div className="mt-3 flex items-center justify-center gap-3">
          <GoogleButton onClick={handleGoogleLogin} />
          <FacebookButton onClick={handleFacebookLogin} />
        </div>
      </div>
      <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
        <p className="text-sm text-gray-400">
          Already have an account?{" "}
          <Link to={"/login"} className="text-green-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default SignupPage;

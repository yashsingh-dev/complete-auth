import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { Loader } from "lucide-react";

const AskEmailVerifyPage = () => {
  const navigate = useNavigate();
  const { user, sendVerifyEmailOTP, loader } = useAuthStore();

  async function handleSumbit() {
    let token = null;
    token = await sendVerifyEmailOTP();
    token ? navigate(`/verify-email/${token}`) : '';
  }

  return (
    <div className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
          Want To Verify Your Email?
        </h2>
        <p className="text-center text-gray-300 mb-6">
          We will send you a 6 digit otp on your email{" "}
          <span className="text-green-500 font-medium">{user.email}</span>
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loader}
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          className="cursor-pointer w-full bg-gradient-to-r outline-1 outline-green-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 hover:outline-0 disabled:opacity-50"
        >
          Skip
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          onClick={handleSumbit}
          disabled={loader}
          className="mt-3 cursor-pointer w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none disabled:opacity-50"
        >
          {loader ? (
            <Loader className="w-6 h-6 animate-spin mx-auto" />
          ) : (
            "Continue"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default AskEmailVerifyPage;

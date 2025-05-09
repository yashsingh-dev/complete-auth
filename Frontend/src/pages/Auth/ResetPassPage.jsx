import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, Loader, Lock, LockKeyholeIcon } from "lucide-react";
import toast from "react-hot-toast";
import PasswordStrengthMeter from "../../components/PasswordStrengthMeter";
import { useAuthStore } from "../../store/useAuthStore";
import { Constants } from "../../config/constants";

const ResetPassPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passVisible1, setPassVisible1] = useState(false);
  const [passVisible2, setPassVisible2] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  const { resetPass, loader } = useAuthStore();
  const { token } = useParams();

  function validation() {
    if (!password.trim()) {
      toast.error(Constants.PASS_REQUIRED);
      return false;
    } else if (password.trim().length < 6) {
      toast.error(Constants.MIN_LENGTH_PASS);
      return false;
    } else if (password !== confirmPassword) {
      toast.error(Constants.PASS_NOT_MATCH);
      return false;
    } else if (passwordStrength == "Weak" || passwordStrength == "Very Weak") {
      toast.error(Constants.CHOOSE_STRONG_PASS);
      return false;
    }
    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validation()) {
      const success = await resetPass(token, password);
      success ? navigate("/login") : "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Password 1 */}
          <div className="relative mt-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="size-5 text-green-500" />
            </div>
            <input
              type={passVisible1 ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 pl-10 pr-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white transition delay-70"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setPassVisible1(!passVisible1)}
            >
              {passVisible1 ? (
                <Eye className="cursor-pointer h-5 w-5 text-base-content/40 text-green-600" />
              ) : (
                <EyeOff className="cursor-pointer h-5 w-5 text-base-content/40 text-green-600" />
              )}
            </button>
          </div>

          {/* Password 2 */}
          <div className="relative mt-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <LockKeyholeIcon className="size-5 text-green-500" />
            </div>
            <input
              type={passVisible2 ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-12 pl-10 pr-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white transition delay-70"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setPassVisible2(!passVisible2)}
            >
              {passVisible2 ? (
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

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none transition duration-200 cursor-pointer"
            type="submit"
            disabled={loader}
          >
            {loader ? (
              <Loader className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              "Set New Password"
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default ResetPassPage;

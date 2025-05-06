import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import Spinner from "../components/Spinner";

const AuthenticatedUser = ({ children }) => {
  const { user, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) return <Spinner />;
  if (user) return <Navigate to="/" replace />;
  return children;
};

export default AuthenticatedUser;

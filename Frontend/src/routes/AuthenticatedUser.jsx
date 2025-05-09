import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const AuthenticatedUser = ({ children }) => {
  const { user, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
};

export default AuthenticatedUser;

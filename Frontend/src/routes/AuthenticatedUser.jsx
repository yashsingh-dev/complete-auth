import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Constants } from "../config/constants";

const AuthenticatedUser = ({ children }) => {
  const { user, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) return null;
  if (user) return <Navigate to={Constants.URI.HOME} replace />;
  return children;
};

export default AuthenticatedUser;

import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const ProtectedRoute = ({ children }) => {
  const { user, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;

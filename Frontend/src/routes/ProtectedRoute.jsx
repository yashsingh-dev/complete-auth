import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import Spinner from "../components/Spinner";

const ProtectedRoute = ({ children }) => {
  const { user, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;

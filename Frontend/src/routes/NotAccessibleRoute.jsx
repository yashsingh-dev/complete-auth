import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const NotAccessibleRoute = ({ children }) => {
  const { isAccessProtectedRoute } = useAuthStore();

  if (isAccessProtectedRoute) {
    return children;
  } else {
    return <Navigate to="/" />;
  }
};

export default NotAccessibleRoute;

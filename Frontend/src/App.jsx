import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import Background from "./components/Background";
import Spinner from "./components/Spinner";
import LoginPage from "./pages/Auth/LoginPage";
import SignupPage from "./pages/Auth/SignupPage";
import DashboardPage from "./pages/Home/DashboardPage";
import EmailVerifyPage from "./pages/Auth/EmailVerifyPage";
import AskEmailVerifyPage from "./pages/Auth/AskEmailVerifyPage";
import ForgetPassPage from "./pages/Auth/ForgetPassPage";
import ResetPassPage from "./pages/Auth/ResetPassPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import AuthenticatedUser from "./routes/AuthenticatedUser";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Constants } from "./config/constants";

function App() {
  const {
    user,
    checkAuth,
    isCheckingAuth,
    startTokenExpiryMonitor,
    stopTokenExpiryMonitor,
  } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!user) return;

    startTokenExpiryMonitor();
    return () => stopTokenExpiryMonitor();
  }, [user, startTokenExpiryMonitor]);

  if (isCheckingAuth) {
    return <Spinner />;
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_KEY}>
      <Background>
        <Routes>
          <Route
            path={Constants.URI.LOGIN}
            element={
              <AuthenticatedUser>
                <LoginPage />
              </AuthenticatedUser>
            }
          />
          <Route
            path={Constants.URI.REGISTER}
            element={
              <AuthenticatedUser>
                <SignupPage />
              </AuthenticatedUser>
            }
          />
          <Route
            path={Constants.URI.FORGET_PASS}
            element={
              <AuthenticatedUser>
                <ForgetPassPage />
              </AuthenticatedUser>
            }
          />
          <Route
            path={Constants.URI.RESET_PASS}
            element={
              <AuthenticatedUser>
                <ResetPassPage />
              </AuthenticatedUser>
            }
          />
          <Route
            path={Constants.URI.HOME}
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={Constants.URI.VERIFY_EMAIL}
            element={
              <ProtectedRoute>
                {user?.isVerified ? (
                  <Navigate to={Constants.URI.HOME} />
                ) : (
                  <EmailVerifyPage />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path={Constants.URI.ASK_VERIFY_EMAIL}
            element={
              <ProtectedRoute>
                {user?.isVerified ? (
                  <Navigate to={Constants.URI.HOME} />
                ) : (
                  <AskEmailVerifyPage />
                )}
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to={Constants.URI.HOME} />} />
        </Routes>

        <Toaster />
      </Background>
    </GoogleOAuthProvider>
  );
}

export default App;

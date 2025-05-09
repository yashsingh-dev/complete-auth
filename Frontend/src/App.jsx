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
            path="/login"
            element={
              <AuthenticatedUser>
                <LoginPage />
              </AuthenticatedUser>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthenticatedUser>
                <SignupPage />
              </AuthenticatedUser>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthenticatedUser>
                <ForgetPassPage />
              </AuthenticatedUser>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <AuthenticatedUser>
                <ResetPassPage />
              </AuthenticatedUser>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verify-email/:token"
            element={
              <ProtectedRoute>
                {user?.isVerified ? <Navigate to="/" /> : <EmailVerifyPage />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/verify-email"
            element={
              <ProtectedRoute>
                {user?.isVerified ? (
                  <Navigate to="/" />
                ) : (
                  <AskEmailVerifyPage />
                )}
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <Toaster />
      </Background>
    </GoogleOAuthProvider>
  );
}

export default App;

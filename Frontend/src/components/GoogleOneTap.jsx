import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";


const GoogleOneTap = () => {
  const { user, googleOneTapLogin } = useAuthStore();

  useEffect(() => {
    if (user || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_KEY,
      callback: async (credentialResponse) => {
        if (credentialResponse?.credential) {
          try {
            await googleOneTapLogin(credentialResponse);
          } catch (err) {
            console.error("Google One Tap login failed:", err);
          }
        }
      },
      auto_select: true,
      cancel_on_tap_outside: false,
      use_fedcm_for_prompt: true,
    });

    window.google.accounts.id.prompt((notification) => {
      // console.log("One Tap prompt notification:", notification);
    });
  }, [user, googleOneTapLogin]);

  return null;
};

export default GoogleOneTap;

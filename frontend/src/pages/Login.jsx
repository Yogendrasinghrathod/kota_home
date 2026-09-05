import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  exchangePhoneEmailToken,
  signInWithPhoneEmail,
  loginUser,
} from "../config/services/authService";
import { useAuth } from "../context/AuthContext.jsx";

const clientId = import.meta.env.VITE_PHONE_EMAIL_CLIENT_ID;
const PHONE_EMAIL_MESSAGE = "PHONE_EMAIL_TOKEN";

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const finishingRef = useRef(false);
  const isOwnerRef = useRef(isOwner);

  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    isOwnerRef.current = isOwner;
  }, [isOwner]);

  const finishLogin = async (accessToken) => {
    if (!accessToken || finishingRef.current) return;
    finishingRef.current = true;

    try {
      setError("");
      setLoading(true);

      const { customToken } = await exchangePhoneEmailToken(accessToken);
      const firebaseUser = await signInWithPhoneEmail(customToken);
      const idToken = await firebaseUser.getIdToken();
      const role = isOwnerRef.current ? "OWNER" : "STUDENT";
      const data = await loginUser(idToken, role);

      setUser(data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      finishingRef.current = false;
      console.error(err);
      setError(
        err.response?.data?.message || err.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const accessToken =
      searchParams.get("access_token") || searchParams.get("phtoken");

    if (!accessToken) return;

    if (window.opener) {
      window.opener.postMessage(
        { type: PHONE_EMAIL_MESSAGE, accessToken },
        window.location.origin
      );
      window.close();
      return;
    }

    finishLogin(accessToken);
    navigate("/login", { replace: true });
  }, [searchParams]);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== PHONE_EMAIL_MESSAGE) return;
      finishLogin(event.data.accessToken);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const openPhoneEmail = () => {
    if (!clientId) {
      setError(
        "Add VITE_PHONE_EMAIL_CLIENT_ID from https://admin.phone.email"
      );
      return;
    }

    const redirectUrl = `${window.location.origin}/login`;
    const authUrl = `https://www.phone.email/auth/log-in?client_id=${encodeURIComponent(
      clientId
    )}&redirect_url=${encodeURIComponent(redirectUrl)}`;

    const left = (window.screen.width - 500) / 2;
    const top = (window.screen.height - 600) / 2;

    const popup = window.open(
      authUrl,
      "peLoginWindow",
      `toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=0,width=500,height=560,top=${top},left=${left}`
    );

    if (!popup) {
      setError("Allow popups for this site to sign in");
    }
  };

  return (
    <div className="min-h-dvh bg-gray-50 flex items-center justify-center">
      <div className="flex min-h-dvh w-full max-w-[375px] flex-col overflow-visible bg-white sm:min-h-[812px] sm:rounded-xl sm:border sm:border-gray-200">
        <div className="h-12 shrink-0 flex items-center px-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-lg text-gray-700"
          >
            ←
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-5 pb-[env(safe-area-inset-bottom)]">
          <div className="pt-4 text-center">
            <h1 className="text-[18px] font-bold text-violet-600">
              Kota Home
            </h1>

            <h2 className="mt-5 text-[13px] font-bold text-gray-900">
              Welcome back! 👋
            </h2>

            <p className="mt-2 text-[10px] leading-[15px] text-gray-500">
              Verify your phone number
              <br />
              to continue
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="relative inline-block h-5 w-11">
              <input
                id="role-toggle"
                type="checkbox"
                checked={isOwner}
                onChange={(e) => setIsOwner(e.target.checked)}
                className="peer h-5 w-11 cursor-pointer appearance-none rounded-full bg-slate-200 transition-colors duration-300 checked:bg-violet-600"
              />
              <label
                htmlFor="role-toggle"
                className="absolute left-0 top-0 h-5 w-5 cursor-pointer rounded-full border border-slate-300 bg-white shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-violet-600"
              />
            </div>
            <label htmlFor="role-toggle" className="cursor-pointer text-xs text-gray-600">
              {isOwner ? "Owner" : "Student"}
            </label>
          </div>

          {error && (
            <p className="mt-4 text-center text-[9px] text-red-500">{error}</p>
          )}

          <button
            type="button"
            onClick={openPhoneEmail}
            disabled={loading}
            className="mt-6 flex h-[44px] w-full items-center justify-center gap-2 rounded-md bg-[#02BD7E] text-[12px] font-semibold text-white disabled:opacity-50"
          >
            <img
              src="https://storage.googleapis.com/prod-phoneemail-prof-images/phem-widgets/phem-phone.svg"
              alt=""
              className="h-5 w-5"
            />
            {loading ? "Signing in..." : "Sign in with Phone"}
          </button>

          <p className="mt-3 text-center text-[9px] text-gray-400">
            OTP is sent by Phone.Email. Firebase SMS is not used.
          </p>

          <p className="mt-auto pb-6 text-center text-[8px] leading-[13px] text-gray-400">
            By continuing, you agree to our
            <br />
            <span className="text-violet-600">Terms of Service</span> and{" "}
            <span className="text-violet-600">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

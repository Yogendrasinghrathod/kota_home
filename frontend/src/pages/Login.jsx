import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  exchangePhoneEmailToken,
  signInWithPhoneEmail,
  loginUser,
} from "../config/services/authService";
import { useAuth } from "../context/AuthContext.jsx";

const clientId = import.meta.env.VITE_PHONE_EMAIL_CLIENT_ID;

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const finishingRef = useRef(false);
  const isOwnerRef = useRef(isOwner);
  const finishLoginRef = useRef(null);

  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    isOwnerRef.current = isOwner;
  }, [isOwner]);

  const finishLogin = async ({ accessToken, userJsonUrl }) => {
    if ((!accessToken && !userJsonUrl) || finishingRef.current) return;
    finishingRef.current = true;

    try {
      setError("");
      setLoading(true);

      const { customToken } = await exchangePhoneEmailToken({
        accessToken,
        userJsonUrl,
      });
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

  finishLoginRef.current = finishLogin;

  useEffect(() => {
    const accessToken =
      searchParams.get("access_token") || searchParams.get("phtoken");
    const userJsonUrl = searchParams.get("user_json_url");

    if (userJsonUrl) {
      finishLogin({ userJsonUrl });
      navigate("/login", { replace: true });
      return;
    }

    if (!accessToken) return;

    finishLogin({ accessToken });
    navigate("/login", { replace: true });
  }, [searchParams]);

  useEffect(() => {
    window.phoneEmailListener = (userObj) => {
      if (!userObj?.user_json_url) return;
      finishLoginRef.current?.({ userJsonUrl: userObj.user_json_url });
    };

    const container = document.getElementById("pe-signin-button");
    if (!container || container.querySelector("script[data-pe-sdk]")) {
      return () => {
        window.phoneEmailListener = undefined;
      };
    }

    const script = document.createElement("script");
    script.src = "https://www.phone.email/sign_in_button_v1.js";
    script.async = true;
    script.dataset.peSdk = "true";
    container.appendChild(script);

    return () => {
      window.phoneEmailListener = undefined;
    };
  }, []);

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

          {loading ? (
            <p className="mt-6 text-center text-[12px] text-gray-500">
              Signing in...
            </p>
          ) : (
            <div className="mt-6 flex w-full justify-center">
              <div
                id="pe-signin-button"
                className="pe_signin_button"
                data-client-id={clientId}
              />
            </div>
          )}

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

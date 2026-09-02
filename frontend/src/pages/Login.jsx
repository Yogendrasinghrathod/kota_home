import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendOTP, verifyOTP } from "../config/services/authService";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSendOTP = async () => {
    try {
      setError("");

      const phoneNumber = `+91${phone}`;

      await sendOTP(phoneNumber);

      setOtpSent(true);
      alert("OTP sent!");
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setError("");

      const firebaseUser = await verifyOTP(otp);
      await firebaseUser.getIdToken();

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">

      {/* MOBILE APP SCREEN */}
      <div className="w-full max-w-[375px] min-h-screen bg-white sm:min-h-[812px] sm:max-h-[812px] sm:rounded-xl sm:border sm:border-gray-200 overflow-hidden">

        {/* TOP BAR */}
        <div className="h-12 flex items-center px-4">
          <button
            type="button"
            className="text-lg text-gray-700"
          >
            ←
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-5">

          {/* TITLE */}
          <div className="pt-7 text-center">

            <h1 className="text-[18px] font-bold text-violet-600">
              Kota Home
            </h1>

            <h2 className="mt-5 text-[13px] font-bold text-gray-900">
              Welcome back! 👋
            </h2>

            <p className="mt-2 text-[10px] leading-[15px] text-gray-500">
              Enter your phone number
              <br />
              to continue
            </p>

          </div>

          {/* PHONE */}
          <div className="mt-6 flex h-[38px] items-center rounded-md border border-gray-200 px-3">

            <span className="text-[9px] text-gray-500">
              🇮🇳
            </span>

            <span className="ml-1.5 text-[10px] text-gray-600">
              +91
            </span>

            <input
              type="tel"
              placeholder="98765 43210"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, ""))
              }
              maxLength={10}
              className="ml-2 min-w-0 flex-1 bg-transparent text-[10px] text-gray-700 outline-none placeholder:text-gray-400"
            />

          </div>

          {/* OTP */}
          {!otpSent ? (
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={phone.length !== 10}
              className="mt-3 h-[38px] w-full rounded-md bg-violet-600 text-[10px] font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              Send OTP
            </button>
          ) : (
            <>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ""))
                }
                maxLength={6}
                className="mt-3 h-[38px] w-full rounded-md border border-gray-200 px-3 text-[10px] outline-none focus:border-violet-500"
              />

              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={otp.length !== 6}
                className="mt-3 h-[38px] w-full rounded-md bg-violet-600 text-[10px] font-medium text-white disabled:opacity-50"
              >
                Verify OTP
              </button>
            </>
          )}

          {/* ERROR */}
          {error && (
            <p className="mt-2 text-center text-[9px] text-red-500">
              {error}
            </p>
          )}

          {/* TERMS */}
          <p className="mt-5 text-center text-[8px] leading-[13px] text-gray-400">
            By continuing, you agree to our
            <br />
            <span className="text-violet-600">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-violet-600">
              Privacy Policy
            </span>
          </p>

        </div>

        {/* RECAPTCHA */}
        <div id="recaptcha-container"></div>

      </div>
    </div>
  );
};

export default Login;
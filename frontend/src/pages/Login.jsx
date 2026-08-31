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

      // Firebase expects country code
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

      // Firebase verifies the OTP
      await verifyOTP(otp);

      console.log("Firebase authentication successful");

      // AuthContext will detect the Firebase login.
      // Navigate to dashboard.
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "400px",
        margin: "auto",
      }}
    >
      <h1>Kota Home</h1>

      <h2>Phone Login</h2>

      <input
        type="text"
        placeholder="10 digit phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        maxLength={10}
      />

      <button onClick={handleSendOTP}>
        Send OTP
      </button>

      {otpSent && (
        <>
          <br />
          <br />

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
          />

          <button onClick={handleVerifyOTP}>
            Verify OTP
          </button>
        </>
      )}

      <div id="recaptcha-container"></div>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Login;
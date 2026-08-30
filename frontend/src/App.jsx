import { useState } from "react";
import { sendOTP, verifyOTP } from "./config/services/authService";

function App() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

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
  
      // 1. Verify OTP with Firebase
      const loggedInUser = await verifyOTP(otp);
  
      // 2. Get Firebase ID token
      const idToken = await loggedInUser.getIdToken();
  
      // 3. Send token to our backend
      const response = await fetch(
        "http://localhost:3000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Backend login failed");
      }
  
      console.log("Backend response:", data);
  
      // Firebase user
      setUser(loggedInUser);
  
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h1>Kota Home</h1>

      {!user ? (
        <>
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
        </>
      ) : (
        <>
          <h2>Login Successful 🎉</h2>

          <p>
            <strong>UID:</strong> {user.uid}
          </p>

          <p>
            <strong>Phone:</strong> {user.phoneNumber}
          </p>
        </>
      )}
    </div>
  );
}

export default App;
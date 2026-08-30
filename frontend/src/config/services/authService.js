import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
  } from "firebase/auth";
  
  import { auth } from "../firebase";
  
  export const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );
    }
  };
  
  export const sendOTP = async (phoneNumber) => {
    setupRecaptcha();
  
    const appVerifier = window.recaptchaVerifier;
  
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      appVerifier
    );
  
    window.confirmationResult = confirmationResult;
  
    return confirmationResult;
  };
  
  export const verifyOTP = async (otp) => {
    if (!window.confirmationResult) {
      throw new Error("Please request OTP first");
    }
  
    const result = await window.confirmationResult.confirm(otp);
  
    return result.user;
  };
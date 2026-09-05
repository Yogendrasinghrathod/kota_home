import {
  signInWithCustomToken,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import api from "../axios.js";
import { auth } from "../firebase";

export const subscribeToAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const exchangePhoneEmailToken = async (accessToken) => {
  const response = await api.post("/auth/phone-email", {
    access_token: accessToken,
  });
  return response.data;
};

export const signInWithPhoneEmail = async (customToken) => {
  const result = await signInWithCustomToken(auth, customToken);
  return result.user;
};

export const loginUser = async (idToken, role) => {
  const response = await api.post(
    "/auth/login",
    { role },
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    }
  );

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateProfile = async (name) => {
  const response = await api.patch("/auth/profile", { name });
  return response.data;
};

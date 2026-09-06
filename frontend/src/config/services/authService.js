import {
  signInWithCustomToken,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import api from "../axios.js";
import { auth } from "../firebase";
import { cacheKeys, cachedGet, clearCache, setCache } from "../queryCache.js";

export const subscribeToAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const logoutUser = async () => {
  clearCache();
  await signOut(auth);
};

export const exchangePhoneEmailToken = async ({
  accessToken,
  userJsonUrl,
  role,
}) => {
  const response = await api.post("/auth/phone-email", {
    access_token: accessToken,
    user_json_url: userJsonUrl,
    role,
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

export const getCurrentUser = () =>
  cachedGet(cacheKeys.me(), async () => {
    const response = await api.get("/auth/me");
    return response.data;
  });

export const updateProfile = async (name) => {
  const response = await api.patch("/auth/profile", { name });
  if (response.data?.user) {
    setCache(cacheKeys.me(), { user: response.data.user });
  }
  return response.data;
};

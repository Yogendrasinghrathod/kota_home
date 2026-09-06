import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { subscribeToAuthState, getCurrentUser } from "../config/services/authService";
import { cacheKeys, clearCache, setCache } from "../config/queryCache.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef(user);
  userRef.current = user;

  const setUser = useCallback((next) => {
    userRef.current = next;
    if (next) {
      setCache(cacheKeys.me(), { user: next });
    } else {
      clearCache();
    }
    setUserState(next);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      if (!firebaseUser) {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      const alreadyReady =
        userRef.current?.firebaseUid === firebaseUser.uid;

      if (alreadyReady) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser();
        if (!cancelled) setUser(data.user);
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Auth initialization error:", error);
          if (!cancelled) setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
    }),
    [user, loading, setUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
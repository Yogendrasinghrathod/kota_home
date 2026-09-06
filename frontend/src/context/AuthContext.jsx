import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { subscribeToAuthState, getCurrentUser } from "../config/services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    [user, loading]
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
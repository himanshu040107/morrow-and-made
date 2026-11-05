import { useContext, createContext, useEffect, useState } from "react";
import { getMe, refreshSession } from "../api/auth.api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    window.__marketAccessToken = accessToken;
  }, [accessToken]);

  useEffect(() => {
    let active = true;
    refreshSession()
      .then(({ accessToken: token }) => getMe(token).then(({ data }) => {
        if (active) { setAccessToken(token); setUser(data); }
      }))
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        setLoading,
        accessToken,
        setAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthHandlers, logoutSession } from "../api/endpoints";

const STORAGE_TOKEN_KEY = "auth_token";
const STORAGE_REFRESH_TOKEN_KEY = "auth_refresh_token";
const STORAGE_ROLE_KEY = "auth_role";
const STORAGE_EMAIL_KEY = "auth_email";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null); // "child" | "parent"
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const applyAuthPayload = async (authPayload, persist) => {
    const userRoleRaw =
      typeof authPayload === "string" ? authPayload : authPayload?.role;
    const userRole = userRoleRaw ? userRoleRaw.toLowerCase() : null;
    const authToken =
      typeof authPayload === "object" ? authPayload?.token : null;
    const authRefreshToken =
      typeof authPayload === "object" ? authPayload?.refreshToken : null;
    const authEmail =
      typeof authPayload === "object" ? authPayload?.email : null;

    setRole(userRole);
    setToken(authToken);
    if (authRefreshToken) setRefreshToken(authRefreshToken);
    if (authEmail) setEmail(authEmail);
    setIsLoggedIn(true);

    if (persist) {
      try {
        await AsyncStorage.multiSet([
          [STORAGE_TOKEN_KEY, authToken || ""],
          [STORAGE_REFRESH_TOKEN_KEY, authRefreshToken || ""],
          [STORAGE_ROLE_KEY, userRole || ""],
          [STORAGE_EMAIL_KEY, authEmail || ""],
        ]);
      } catch (err) {
        console.warn("Failed to persist auth session", err);
      }
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [
          [, storedToken],
          [, storedRefreshToken],
          [, storedRole],
          [, storedEmail],
        ] = await AsyncStorage.multiGet([
          STORAGE_TOKEN_KEY,
          STORAGE_REFRESH_TOKEN_KEY,
          STORAGE_ROLE_KEY,
          STORAGE_EMAIL_KEY,
        ]);

        if (storedToken && storedRole) {
          setToken(storedToken);
          setRole(storedRole);
          if (storedRefreshToken) setRefreshToken(storedRefreshToken);
          if (storedEmail) setEmail(storedEmail);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.warn("Failed to restore auth session", err);
      } finally {
        setIsRestoring(false);
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    setAuthHandlers({
      getAccessToken: () => token,
      getRefreshToken: () => refreshToken,
      onUpdateTokens: (authPayload) => applyAuthPayload(authPayload, true),
      onLogout: () => logout(),
    });
  }, [token, refreshToken]);

  const login = async (authPayload) => {
    await applyAuthPayload(authPayload, true);
  };

  const logout = async () => {
    if (refreshToken) {
      try {
        await logoutSession(refreshToken);
      } catch (err) {
        console.warn("Failed to revoke refresh token", err);
      }
    }

    setRole(null);
    setToken(null);
    setRefreshToken(null);
    setEmail(null);
    setIsLoggedIn(false);

    try {
      await AsyncStorage.multiRemove([
        STORAGE_TOKEN_KEY,
        STORAGE_REFRESH_TOKEN_KEY,
        STORAGE_ROLE_KEY,
        STORAGE_EMAIL_KEY,
      ]);
    } catch (err) {
      console.warn("Failed to clear auth session", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        role,
        token,
        refreshToken,
        email,
        isRestoring,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
import { createContext, useContext, useState } from "react";
import { loginParent, loginChild, registerParent } from "../api/auth";
import { setAuthToken } from "../api/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null); // "Child" | "Parent"
  const [user, setUser] = useState(null); // { userId, email, fullName, role, token }

  const handleLoginResponse = (data) => {
    if (!data?.token) throw new Error("Missing token");
    setAuthToken(data.token);
    setRole(data.role);
    setUser(data);
    setIsLoggedIn(true);
  };

  const loginParentFn = async (email, password) => {
    const data = await loginParent({ email, password });
    handleLoginResponse(data);
    return data;
  };

  const loginChildFn = async (email, password) => {
    const data = await loginChild({ email, password });
    handleLoginResponse(data);
    return data;
  };

  const registerParentFn = async (payload) => {
    const data = await registerParent(payload);
    handleLoginResponse(data);
    return data;
  };

  const logout = () => {
    setRole(null);
    setIsLoggedIn(false);
    setUser(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        role,
        user,
        loginParent: loginParentFn,
        loginChild: loginChildFn,
        registerParent: registerParentFn,
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

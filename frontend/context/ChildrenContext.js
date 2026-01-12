import React, { createContext, useContext, useEffect, useState } from "react";
import { getChildren } from "../api/endpoints";
import { useAuth } from "./AuthContext";

const ChildrenContext = createContext();

export const ChildrenProvider = ({ children }) => {
  const [childrenList, setChildrenList] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [childrenError, setChildrenError] = useState("");
  const { token, isRestoring } = useAuth();

  const normalizeChild = (child) => {
    if (!child) return null;
    const fullName =
      child.fullName ||
      [child.firstName, child.lastName].filter(Boolean).join(" ") ||
      child.name ||
      "";
    return {
      id: child.id || child.childId || child.email || Date.now().toString(),
      name: fullName,
      firstName: child.firstName || fullName.split(" ")[0] || "",
      lastName: child.lastName || fullName.split(" ").slice(1).join(" "),
      email: child.email,
      monthlyAllowance: child.monthlyAllowance,
      raw: child,
    };
  };

  const addChild = (child) => {
    const normalized = normalizeChild(child);
    if (!normalized) return;
    setChildrenList((prev) => [...prev, normalized]);
  };

  const refreshChildren = async (options = {}) => {
    const hasExisting = childrenList.length > 0;
    const showLoader = options.force || !hasExisting;
    if (!token) return;
    if (showLoader) {
      setLoadingChildren(true);
    }
    setChildrenError("");
    try {
      const data = await getChildren(token);
      const normalized = Array.isArray(data)
        ? data.map((c) => normalizeChild(c)).filter(Boolean)
        : [];
      setChildrenList(normalized);
    } catch (err) {
      setChildrenError(err?.message || "Neuspješno učitavanje djece.");
    } finally {
      if (showLoader) {
        setLoadingChildren(false);
      }
    }
  };

  useEffect(() => {
    if (!isRestoring && token) {
      refreshChildren({ force: true });
    }
  }, [isRestoring, token]);

  return (
    <ChildrenContext.Provider
      value={{
        childrenList,
        addChild,
        refreshChildren,
        loadingChildren,
        childrenError,
      }}
    >
      {children}
    </ChildrenContext.Provider>
  );
};

export const useChildren = () => useContext(ChildrenContext);
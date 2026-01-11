import React, { createContext, useContext, useState, useCallback } from "react";
import { createChild, listChildren } from "../api/children";
import { useAuth } from "./AuthContext";

const ChildrenContext = createContext();

export const ChildrenProvider = ({ children }) => {
  const { role } = useAuth();
  const [childrenList, setChildrenList] = useState([]);

  const refreshChildren = useCallback(async () => {
    if (role !== "Parent") return;
    try {
      const data = await listChildren();
      const mapped = (data || []).map((c) => ({
        id: c.id,
        email: c.email,
        name: c.fullName || `${c.firstName} ${c.lastName}`,
        firstName: c.firstName,
        lastName: c.lastName,
        monthlyAllowance: c.monthlyAllowance,
        currentBalance: c.currentBalance,
        points: c.points,
      }));
      setChildrenList(mapped);
    } catch (err) {
      console.warn("Failed to load children", err?.response?.data || err.message);
    }
  }, [role]);

  const addChild = async (payload) => {
    const created = await createChild(payload);
    const mapped = {
      id: created.id,
      email: created.email,
      name: created.fullName || `${created.firstName} ${created.lastName}`,
      firstName: created.firstName,
      lastName: created.lastName,
      monthlyAllowance: created.monthlyAllowance,
      currentBalance: created.currentBalance,
      points: created.points,
    };
    setChildrenList((prev) => [...prev, mapped]);
    return mapped;
  };

  return (
    <ChildrenContext.Provider
      value={{ childrenList, addChild, refreshChildren }}
    >
      {children}
    </ChildrenContext.Provider>
  );
};

export const useChildren = () => useContext(ChildrenContext);

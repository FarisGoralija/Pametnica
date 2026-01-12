import React, { createContext, useContext, useState } from "react";

const ChildrenContext = createContext();

export const ChildrenProvider = ({ children }) => {
  const [childrenList, setChildrenList] = useState([]);

  const addChild = (child) => {
    setChildrenList((prev) => [...prev, child]);
  };

  return (
    <ChildrenContext.Provider value={{ childrenList, addChild }}>
      {children}
    </ChildrenContext.Provider>
  );
};

export const useChildren = () => useContext(ChildrenContext);
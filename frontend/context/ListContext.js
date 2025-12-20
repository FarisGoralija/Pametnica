import React, { createContext, useContext, useState } from "react";

const ListContext = createContext();

export const ListProvider = ({ children }) => {
  const [lists, setLists] = useState([]);

  const addList = (title, items) => {
    setLists((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title,
        items,
        status: "active",
        createdAt: new Date(),
      },
    ]);
  };

  return (
    <ListContext.Provider value={{ lists, addList }}>
      {children}
    </ListContext.Provider>
  );
};

export const useList = () => useContext(ListContext);

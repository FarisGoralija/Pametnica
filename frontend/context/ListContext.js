import React, { createContext, useContext, useState } from "react";

const ListContext = createContext();

export const ListProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addItem = (text) => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
      },
    ]);
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <ListContext.Provider value={{ items, addItem, removeItem }}>
      {children}
    </ListContext.Provider>
  );
};

export const useList = () => useContext(ListContext);

import React, { createContext, useContext, useState } from "react";

const ListContext = createContext();

export const ListProvider = ({ children }) => {
  const [lists, setLists] = useState([]);

  // ❗ CHILD FLOW — UNCHANGED
  const addList = (title, items) => {
    setLists((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title,
        items: items || [],
        status: "active", // child logic untouched
        parentApproved: false, // 👈 NEW (parent-only)
        createdAt: new Date(),
      },
    ]);
  };

  // ✅ PARENT ONLY
  const approveList = (listId) => {
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, parentApproved: true } : l))
    );
  };

  const deleteItem = (listId, itemId) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? { ...l, items: l.items.filter((i) => i.id !== itemId) }
          : l
      )
    );
  };

  const editItem = (listId, itemId, newName) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              items: l.items.map((i) =>
                i.id === itemId ? { ...i, name: newName } : i
              ),
            }
          : l
      )
    );
  };

  return (
    <ListContext.Provider
      value={{
        lists,
        addList, // child
        approveList, // parent
        deleteItem, // parent
        editItem, // parent
      }}
    >
      {children}
    </ListContext.Provider>
  );
};

export const useList = () => useContext(ListContext);

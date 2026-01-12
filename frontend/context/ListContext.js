import React, { createContext, useContext, useState } from "react";

const ListContext = createContext();

export const ListProvider = ({ children }) => {
  const [lists, setLists] = useState([]);

  /* =====================================================
     CHILD SIDE (UNCHANGED)
     ===================================================== */

  const addList = (title, items = []) => {
    setLists((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title,
        items, // items created by child
        status: "active", // do NOT change (child logic)
        parentApproved: false, // parent-only flag
        createdAt: new Date(),
      },
    ]);
  };

  /* =====================================================
     PARENT SIDE ONLY
     ===================================================== */

  // Approve list (Čekanje → Odobrene)
  const approveList = (listId) => {
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, parentApproved: true } : l))
    );
  };

  // Add new item to list
  const addItem = (listId, text) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              items: [
                ...l.items,
                {
                  id: Date.now().toString(),
                  text,
                },
              ],
            }
          : l
      )
    );
  };

  // Edit item text
  const editItem = (listId, itemId, newText) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              items: l.items.map((item) =>
                item.id === itemId ? { ...item, text: newText } : item
              ),
            }
          : l
      )
    );
  };

  // Delete item
  const deleteItem = (listId, itemId) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              items: l.items.filter((item) => item.id !== itemId),
            }
          : l
      )
    );
  };

  return (
    <ListContext.Provider
      value={{
        lists,

        // child
        addList,

        // parent
        approveList,
        addItem,
        editItem,
        deleteItem,
      }}
    >
      {children}
    </ListContext.Provider>
  );
};

export const useList = () => useContext(ListContext);
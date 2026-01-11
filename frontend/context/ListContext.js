import React, { createContext, useContext, useState } from "react";
import {
  createShoppingList,
  addItem as apiAddItem,
  updateItem as apiUpdateItem,
  deleteItem as apiDeleteItem,
  submitList,
  completeItem as apiCompleteItem,
  getChildPending,
  getChildActive,
  getChildHistory,
  getParentPending,
  getParentActive,
  approveList as apiApproveList,
  rejectList as apiRejectList,
} from "../api/shoppingLists";
import { useAuth } from "./AuthContext";

const ListContext = createContext();

const mapList = (l, childIdOverride) => {
  const statusNumber = typeof l.status === "number" ? l.status : l.status ?? 0;
  const status =
    statusNumber === 1 ? "active" : statusNumber === 0 ? "waiting" : "history";

  const parentApproved = statusNumber === 1;
  return {
    id: l.id,
    childId: childIdOverride || l.childId,
    title: l.title,
    createdAt: l.createdAt,
    status,
    parentApproved,
    totalCost: l.totalCost,
    items:
      l.items?.map((i) => ({
        id: i.id,
        text: i.name,
        price: i.price,
        isCompleted: i.isCompleted,
      })) || [],
  };
};

export const ListProvider = ({ children }) => {
  const [lists, setLists] = useState([]);
  const [parentChildId, setParentChildId] = useState(null);
  const { role } = useAuth();

  const loadChildLists = async () => {
    const [pending, active, history] = await Promise.all([
      getChildPending(),
      getChildActive(),
      getChildHistory(),
    ]);
    const merged = [
      ...(pending || []).map((l) => mapList(l)),
      ...(active || []).map((l) => mapList(l)),
      ...(history || []).map((l) => mapList(l)),
    ];
    setLists(merged);
    return merged;
  };

  const loadParentLists = async (childId) => {
    const [pending, active] = await Promise.all([
      getParentPending(childId),
      getParentActive(childId),
    ]);
    const merged = [...(pending || []), ...(active || [])].map((l) =>
      mapList(l, childId)
    );
    setLists(merged);
    setParentChildId(childId);
    return merged;
  };

  const addList = async ({ title, items = [], type = 0 }) => {
    const list = await createShoppingList({ title, type });
    const listId = list.id;

    // add items
    for (const item of items) {
      await apiAddItem(listId, { name: item.text || item.name || item });
    }

    // submit if normal
    if (type === 0) {
      await submitList(listId);
    }

    if (role === "Child") await loadChildLists();
    return listId;
  };

  const addItem = async (listId, text) => {
    await apiAddItem(listId, { name: text });
    await refreshAfterChange();
  };

  const editItem = async (listId, itemId, newText, price) => {
    await apiUpdateItem(listId, itemId, { name: newText, price });
    await refreshAfterChange();
  };

  const deleteItem = async (listId, itemId) => {
    await apiDeleteItem(listId, itemId);
    await refreshAfterChange();
  };

  const completeItem = async (listId, itemId, price) => {
    await apiCompleteItem(listId, itemId, { price });
    await refreshAfterChange();
  };

  const approveList = async (listId) => {
    await apiApproveList(listId);
    await loadParentListsForExisting();
  };

  const rejectList = async (listId) => {
    await apiRejectList(listId);
    await loadParentListsForExisting();
  };

  // Helper to refresh parent lists using any child in current list set
  const loadParentListsForExisting = async () => {
    if (parentChildId) {
      await loadParentLists(parentChildId);
    }
  };

  const refreshAfterChange = async () => {
    if (role === "Child") {
      await loadChildLists();
    } else if (role === "Parent") {
      await loadParentListsForExisting();
    }
  };

  return (
    <ListContext.Provider
      value={{
        lists,
        loadChildLists,
        loadParentLists,
        addList,
        addItem,
        editItem,
        deleteItem,
        completeItem,
        approveList,
        rejectList,
      }}
    >
      {children}
    </ListContext.Provider>
  );
};

export const useList = () => useContext(ListContext);

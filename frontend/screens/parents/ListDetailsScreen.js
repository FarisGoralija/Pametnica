import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Platform,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import HeaderWithBack from "../../components/HeaderWithBack";
import AddItemModal from "../../components/AddItemModal";
import { useAuth } from "../../context/AuthContext";
import {
  getParentActiveLists,
  getParentPendingLists,
  updateShoppingListItem,
  approveShoppingList,
  rejectShoppingList,
  addShoppingListItem,
} from "../../api/endpoints";
import { useChildren } from "../../context/ChildrenContext";

const ListDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { listId, childId: childIdParam } = route.params;
  const { token } = useAuth();
  const { childrenList } = useChildren();

  const childId = childIdParam || childrenList?.[0]?.id;

  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);
  const [addingText, setAddingText] = useState("");

  const normalizeList = (l) => {
    if (!l) return null;
    return {
      id: l.id || l.Id,
      title: l.title || l.Title || "Lista",
      status: l.status || l.Status,
      type: l.type || l.Type,
      items: (l.items || l.Items || []).map((it) => ({
        id: it.id || it.Id,
        name: it.name || it.Name || "",
      })),
    };
  };

  const loadList = async () => {
    if (!token || !childId || !listId) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const [activeRes, pendingRes] = await Promise.all([
        getParentActiveLists(token, childId),
        getParentPendingLists(token, childId),
      ]);
      const combined = [
        ...(Array.isArray(activeRes) ? activeRes : []),
        ...(Array.isArray(pendingRes) ? pendingRes : []),
      ];
      const found = combined.find(
        (l) => (l.id || l.Id || "").toString() === listId.toString()
      );
      setList(normalizeList(found));
    } catch (err) {
      setErrorMessage(
        err?.message || "Neuspješno učitavanje liste. Pokušajte ponovo."
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadList();
    }, [listId, token, childId])
  );

  if (!list) {
    return (
      <View style={styles.container}>
        <HeaderWithBack title="Detalji liste" />
        <Text style={styles.emptyText}>
          {loading ? "Učitavanje..." : "Lista nije pronađena."}
        </Text>
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
      </View>
    );
  }

  const isApproved =
    (typeof list.status === "string" &&
      list.status.toLowerCase() === "approved") ||
    list.status === 1;

  const handleSaveList = () => {
    if (!token) return;
    setLoading(true);
    approveShoppingList(list.id, token)
      .then(() => navigation.goBack())
      .catch((err) =>
        setErrorMessage(
          err?.message || "Odobravanje liste nije uspjelo. Pokušajte ponovo."
        )
      )
      .finally(() => setLoading(false));
  };

  const handleReject = () => {
    if (!token) return;
    setLoading(true);
    rejectShoppingList(list.id, token)
      .then(() => navigation.goBack())
      .catch((err) =>
        setErrorMessage(
          err?.message || "Odbijanje liste nije uspjelo. Pokušajte ponovo."
        )
      )
      .finally(() => setLoading(false));
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack title="Detalji liste" />
      </View>

      {/* CARD */}
      <View style={styles.card}>
        {/* TITLE ROW */}
        <View style={styles.titleRow}>
          <Text style={styles.listTitle}>{list.title}</Text>
        </View>

        {/* ITEMS */}
        <ScrollView
          contentContainerStyle={styles.itemsWrapper}
          showsVerticalScrollIndicator={false}
        >
          {list.items.length === 0 ? (
            <Text style={styles.emptyText}>Ova lista nema stavki</Text>
          ) : (
            list.items.map((item) => {
              const isEditing = editingId === item.id;

              return (
                <View key={item.id} style={styles.itemRow}>
                  {/* LEFT ICON */}
                  <MaterialCommunityIcons
                    name={isApproved ? "check-circle" : "check-circle-outline"}
                    size={26}
                    color={isApproved ? "#16A34A" : "#3793F0"}
                  />

                  {/* TEXT / INPUT */}
                  {isEditing ? (
                    <TextInput
                      value={editText}
                      onChangeText={setEditText}
                      style={styles.input}
                      autoFocus
                    />
                  ) : (
                    <Text
                      style={[
                        styles.itemText,
                        isApproved && styles.itemTextApproved,
                      ]}
                    >
                      {item.name}
                    </Text>
                  )}

                  {/* ACTIONS */}
                  {!isApproved && (
                    <>
                      {/* EDIT */}
                      {isEditing ? (
                        <TouchableOpacity
                          onPress={() => {
                            updateShoppingListItem(
                              list.id,
                              item.id,
                              editText,
                              token
                            )
                              .then(() => {
                                setEditingId(null);
                                loadList();
                              })
                              .catch((err) =>
                                setErrorMessage(
                                  err?.message ||
                                    "Ažuriranje stavke nije uspjelo."
                                )
                              );
                          }}
                        >
                          <MaterialCommunityIcons
                            name="check"
                            size={22}
                            color="#16A34A"
                          />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => {
                            setEditingId(item.id);
                            setEditText(item.name);
                          }}
                        >
                          <MaterialCommunityIcons
                            name="pencil"
                            size={22}
                            color="#555"
                          />
                        </TouchableOpacity>
                      )}

                      {/* DELETE */}
                      <TouchableOpacity
                        onPress={() =>
                          updateShoppingListItem(list.id, item.id, "", token, true)
                            .then(() => loadList())
                            .catch((err) =>
                              setErrorMessage(
                                err?.message || "Brisanje stavke nije uspjelo."
                              )
                            )
                        }
                        style={{ marginLeft: 12 }}
                      >
                        <MaterialCommunityIcons
                          name="trash-can-outline"
                          size={22}
                          color="#DC2626"
                        />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>

        {/* ACTION BUTTONS ONLY IF NOT APPROVED */}
        {!isApproved && (
          <View style={styles.actionsColumn}>
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={() => setShowAddItem(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="plus"
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.addItemText}>Dodaj stavku</Text>
            </TouchableOpacity>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.saveButton, styles.rejectButton]}
                onPress={handleReject}
              >
                <Text style={styles.saveText}>Odbij</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveList}
              >
                <Text style={styles.saveText}>Odobri</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      {/* ADD ITEM MODAL (reuse child modal) */}
      {!isApproved && (
        <AddItemModal
          visible={showAddItem}
          onClose={() => setShowAddItem(false)}
          onAdd={(text) => {
            const cleaned = text?.trim();
            if (!cleaned) return;
            addShoppingListItem(list.id, cleaned, token)
              .then(() => {
                setShowAddItem(false);
                setAddingText("");
                loadList();
              })
              .catch((err) =>
                setErrorMessage(
                  err?.message || "Dodavanje stavke nije uspjelo."
                )
              );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  headerWrapper: {
    marginTop: Platform.OS === "android" ? 20 : 80,
  },

  card: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: "#6FD6D4",
    borderRadius: 26,
    padding: 18,
    elevation: 4,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  listTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#4A4A4A",
  },

  itemsWrapper: {
    backgroundColor: "#FFFDF8",
    borderRadius: 18,
    padding: 16,
    paddingBottom: 20,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#3793F0",
  },

  itemText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
    marginRight: 10,
    color: "#4A4A4A",
  },

  itemTextApproved: {
    textDecorationLine: "line-through",
    color: "#6B7280",
  },

  input: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 18,
    marginLeft: 10,
    marginRight: 10,
  },

  emptyText: {
    fontSize: 14,
    color: "#8A8A8A",
    textAlign: "center",
    paddingVertical: 20,
  },

  saveButton: {
    marginTop: 16,
    backgroundColor: "#3793F0",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    minWidth: 120,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  rejectButton: {
    backgroundColor: "#E53935",
  },

  actionsColumn: {
    gap: 12,
    marginTop: 12,
  },

  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3793F0",
    paddingVertical: 12,
    borderRadius: 14,
  },

  addItemText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  errorText: {
    textAlign: "center",
    color: "#E53935",
    fontSize: 14,
    marginTop: 12,
    marginHorizontal: 16,
  },
});

export default ListDetailsScreen;

import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import HeaderWithBack from "../../components/HeaderWithBack";
import AddItemModal from "../../components/AddItemModal";
import { useNavigation, useRoute } from "@react-navigation/native";
import RenameListModal from "../../components/RenameListModal";
import {
  addShoppingListItem,
  createShoppingList,
  deleteShoppingListItem,
  submitShoppingList,
} from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";

const NewListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAuth();

  const [listId, setListId] = useState(route?.params?.listId || null);
  const [listTitle, setListTitle] = useState(
    route?.params?.listTitle || "Lista 1"
  );
  const [listType, setListType] = useState(route?.params?.listType || 1);
  const [showRename, setShowRename] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const nextListId = route?.params?.listId || null;
    const nextTitle = route?.params?.listTitle || "Lista 1";
    const nextType = route?.params?.listType || 1;

    setListId(nextListId);
    setListTitle(nextTitle);
    setListType(nextType);
    setItems([]); // reset items for a fresh list
    setErrorMessage("");
  }, [route?.params]);

  const ensureBackendList = async () => {
    if (listId) return listId;
    const created = await createShoppingList(
      { title: listTitle, listType },
      token
    );
    const newId = created?.id;
    if (!newId) {
      throw new Error("Nije moguće kreirati listu. Pokušajte ponovo.");
    }
    setListId(newId);
    if (created?.title) setListTitle(created.title);
    return newId;
  };

  // For emergency lists, create immediately so they are active
  useEffect(() => {
    if (listType === 2 && !listId && token) {
      setLoadingAction(true);
      ensureBackendList()
        .catch((err) =>
          setErrorMessage(err?.message || "Neuspješno kreiranje liste.")
        )
        .finally(() => setLoadingAction(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listType, listId, token]);

  const addItem = (text) => {
    const cleaned = text.trim();
    if (!cleaned) return;

    // Emergency lists: push items to backend immediately
    if (listType === 2) {
      if (!token) {
        setErrorMessage("Nedostaje autentifikacija. Pokušajte ponovo.");
        return;
      }
      if (loadingAction) return;

      setLoadingAction(true);
      setErrorMessage("");

      ensureBackendList()
        .then((id) => addShoppingListItem(id, cleaned, token))
        .then((result) => {
          if (result && Array.isArray(result.items)) {
            setItems(
              result.items.map((i) => ({
                id: i.id?.toString(),
                text: i.name,
              }))
            );
          } else if (result && result.id) {
            setItems((prev) => [
              ...prev,
              { id: result.id?.toString(), text: result.name || cleaned },
            ]);
          } else {
            setItems((prev) => [
              ...prev,
              { id: Date.now().toString(), text: cleaned },
            ]);
          }
        })
        .catch((err) => {
          const msg =
            err?.message || "Dodavanje stavke nije uspjelo. Pokušajte ponovo.";
          setErrorMessage(msg);
        })
        .finally(() => setLoadingAction(false));

      return;
    }

    // Normal list: local items until submit
    setItems((prev) => [...prev, { id: Date.now().toString(), text: cleaned }]);
  };

  const removeItem = (id) => {
    if (listType === 2 && listId && token) {
      // best-effort backend removal for emergency lists
      deleteShoppingListItem(listId, id, token).catch(() => {});
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSubmit = () => {
    // Normal lists only; emergency handled elsewhere
    if (listType === 2) {
      navigation.goBack();
      return;
    }
    if (!token) {
      setErrorMessage("Nedostaje autentifikacija. Pokušajte ponovo.");
      return;
    }
    if (items.length === 0) {
      setErrorMessage("Dodajte barem jednu stavku prije slanja.");
      return;
    }
    if (loadingAction) return;

    setLoadingAction(true);
    setErrorMessage("");

    let createdListId = listId;

    const ensureList = async () => {
      if (createdListId) return createdListId;
      const created = await createShoppingList(
        { title: listTitle, listType },
        token
      );
      const newId = created?.id;
      if (!newId) {
        throw new Error("Nije moguće kreirati listu. Pokušajte ponovo.");
      }
      setListId(newId);
      if (created?.title) setListTitle(created.title);
      return newId;
    };

    const submitFlow = async () => {
      const id = await ensureList();
      // Add items to backend
      for (const item of items) {
        await addShoppingListItem(id, item.text, token);
      }
      await submitShoppingList(id, token);
      setItems([]); // clear local items after successful submit
      setListId(null);
      navigation.goBack();
    };

    submitFlow()
      .catch((err) => {
        const msg =
          err?.message || "Slanje liste nije uspjelo. Pokušajte ponovo.";
        setErrorMessage(msg);
      })
      .finally(() => setLoadingAction(false));
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack title="Nova Lista" subtitle="" />
      </View>

      {/* ACTIONS ROW */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[
            styles.sendButton,
            listType !== 2 &&
              (items.length === 0 || loadingAction) &&
              styles.sendButtonDisabled,
          ]}
          activeOpacity={0.8}
          onPress={listType === 2 ? () => navigation.goBack() : handleSubmit}
          disabled={listType !== 2 && (items.length === 0 || loadingAction)}
        >
          <MaterialCommunityIcons
            name={listType === 2 ? "check" : "send"}
            size={16}
            color="#FFFFFF"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.sendText}>
            {listType === 2 ? "Dodaj listu" : "Pošalji roditelju"}
          </Text>
        </TouchableOpacity>

        {listType === 2 && (
          <TouchableOpacity
            style={[styles.sendButton, styles.deleteButton]}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="close"
              size={16}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.sendText}>Obriši listu</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* LIST CARD */}
      <View style={styles.card}>
        {/* CARD HEADER */}
        <View style={styles.cardHeader}>
          <Text style={styles.listTitle}>{listTitle}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.8}
              onPress={() => setShowRename(true)}
            >
              <MaterialCommunityIcons name="pencil" size={30} color="#4A4A4A" />
            </TouchableOpacity>

           
          </View>
        </View>

        {/* CONTENT AREA */}
        <View style={styles.emptyState}>
          {items.length === 0 ? (
            <>
              {/* KEEP FUN EMPTY ILLUSTRATION */}
              <View style={styles.illustration}>
                <MaterialCommunityIcons
                  name="cart-outline"
                  size={64}
                  color="#F4C97A"
                />
                <MaterialCommunityIcons
                  name="food-apple"
                  size={26}
                  color="#F06292"
                  style={styles.fruit1}
                />
                <MaterialCommunityIcons
                  name="fruit-watermelon"
                  size={26}
                  color="#299b0cff"
                  style={styles.fruit2}
                />
                <MaterialCommunityIcons
                  name="fruit-cherries"
                  size={24}
                  color="#60064bff"
                  style={styles.fruit3}
                />
              </View>

              <Text style={styles.emptyText}>
                Nemate nijednu stavku na listi
              </Text>
            </>
          ) : (
            <View style={{ width: "100%" }}>
              {items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={26}
                    color="#12C7E5"
                  />

                  <Text style={styles.itemText}>{item.text}</Text>

                  <TouchableOpacity
                    onPress={() => removeItem(item.id)}
                    activeOpacity={0.8}
                    style={styles.itemTrashBtn}
                  >
                    <MaterialCommunityIcons
                      name="trash-can"
                      size={24}
                      color="#E53935"
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* ADD BUTTON ALWAYS VISIBLE */}
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={() => setShowModal(true)}
          >
            <MaterialCommunityIcons
              name="plus"
              size={18}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.addText}>Dodaj stavku</Text>
          </TouchableOpacity>
        </View>
      </View>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      {/* MODAL */}
      <AddItemModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addItem}
      />

      <RenameListModal
        visible={showRename}
        onClose={() => setShowRename(false)}
        onSave={(name) => {
          if (name.trim()) setListTitle(name);
        }}
      />
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

  sendWrapper: {
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#12C7E5",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
  },

  sendButtonDisabled: {
    opacity: 0.6,
  },

  sendText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },

  card: {
    marginHorizontal: 16,
    backgroundColor: "#6FD6D4",
    borderRadius: 26,
    padding: 18,
    elevation: 4,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  listTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#4A4A4A",
  },

  actionBtn: {
    padding: 10,
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: "#EAF7F7",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
  },

  emptyState: {
    backgroundColor: "#FFFDF8",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  illustration: {
    marginBottom: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  fruit1: {
    position: "absolute",
    top: -10,
    right: -18,
  },

  fruit2: {
    position: "absolute",
    bottom: -6,
    left: -18,
  },

  fruit3: {
    position: "absolute",
    top: 18,
    left: -26,
  },

  emptyText: {
    fontSize: 14,
    color: "#8A8A8A",
    marginBottom: 16,
    textAlign: "center",
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#12C7E5",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
    marginTop: 6,
  },

  addText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },

  deleteButton: {
    backgroundColor: "#E53935",
  },

  // ✅ ITEM CARD (with border)
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,

    borderWidth: 2,
    borderColor: "#12C7E5",
  },

  itemText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
    color: "#4A4A4A",
  },

  itemTrashBtn: {
    padding: 6,
    borderRadius: 10,
  },

  errorText: {
    textAlign: "center",
    color: "#E53935",
    fontSize: 14,
    fontFamily: "SFCompactRounded-Regular",
    marginHorizontal: 20,
    marginTop: 12,
  },
});

export default NewListScreen;
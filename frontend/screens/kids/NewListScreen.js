import React, { useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { useList } from "../../context/ListContext";
import RenameListModal from "../../components/RenameListModal";

const NewListScreen = () => {
  const navigation = useNavigation();
  const { addList } = useList();

  const [listTitle, setListTitle] = useState("Lista 1");
  const [showRename, setShowRename] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]);

  const addItem = (text) => {
    const cleaned = text.trim();
    if (!cleaned) return;

    setItems((prev) => [...prev, { id: Date.now().toString(), text: cleaned }]);
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack title="Nova Lista" subtitle="" />
      </View>

      {/* SEND TO PARENT BUTTON */}
      <View style={styles.sendWrapper}>
        <TouchableOpacity
          style={styles.sendButton}
          activeOpacity={0.8}
          onPress={() => {
            if (items.length === 0) return;

            addList(listTitle, items);
            navigation.goBack();
          }}
        >
          <MaterialCommunityIcons
            name="send"
            size={16}
            color="#FFFFFF"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.sendText}>Pošalji roditelju</Text>
        </TouchableOpacity>
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

            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
              <MaterialCommunityIcons
                name="trash-can"
                size={30}
                color="#E53935"
              />
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
});

export default NewListScreen;

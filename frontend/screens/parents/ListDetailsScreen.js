import React, { useState } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";

import HeaderWithBack from "../../components/HeaderWithBack";
import AddItemModal from "../../components/AddItemModal";
import { useList } from "../../context/ListContext";

const ListDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { listId } = route.params;

  const { lists, deleteItem, editItem, approveList, addItem } = useList();

  const list = lists.find((l) => l.id === listId);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);

  if (!list) return null;

  const isApproved = list.parentApproved === true;

  const handleSaveList = () => {
    approveList(list.id);
    navigation.goBack();
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

          {/* ➕ ADD ITEM (ONLY IF NOT APPROVED) */}
          {!isApproved && (
            <TouchableOpacity onPress={() => setShowAddItem(true)}>
              <MaterialCommunityIcons
                name="plus-circle"
                size={32}
                color="#12C7E5"
              />
            </TouchableOpacity>
          )}
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
                    color={isApproved ? "#16A34A" : "#12C7E5"}
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
                    <Text style={styles.itemText}>{item.text}</Text>
                  )}

                  {/* ACTIONS */}
                  {!isApproved && (
                    <>
                      {/* EDIT */}
                      {isEditing ? (
                        <TouchableOpacity
                          onPress={() => {
                            editItem(list.id, item.id, editText);
                            setEditingId(null);
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
                            setEditText(item.text);
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
                        onPress={() => deleteItem(list.id, item.id)}
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

        {/* SAVE BUTTON ONLY IF NOT APPROVED */}
        {!isApproved && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveList}>
            <Text style={styles.saveText}>Spasi listu</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ADD ITEM MODAL */}
      {!isApproved && (
        <AddItemModal
          visible={showAddItem}
          onClose={() => setShowAddItem(false)}
          onAdd={(text) => addItem(list.id, text)}
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
    borderColor: "#12C7E5",
  },

  itemText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
    marginRight: 10,
    color: "#4A4A4A",
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
    backgroundColor: "#12C7E5",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});

export default ListDetailsScreen;

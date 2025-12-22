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
import { useNavigation } from "@react-navigation/native";

import HeaderWithBack from "../../components/HeaderWithBack";
import { useList } from "../../context/ListContext";

const ListDetailsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { list } = route.params;

  const { deleteItem, editItem, approveList } = useList();

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

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
        {/* TITLE */}
        <Text style={styles.listTitle}>{list.title}</Text>

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
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={26}
                    color="#12C7E5"
                  />

                  {isEditing ? (
                    <TextInput
                      value={editText}
                      onChangeText={setEditText}
                      style={styles.input}
                      autoFocus
                    />
                  ) : (
                    <Text style={styles.itemText}>
                      {item.text || item.name}
                    </Text>
                  )}

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
                        setEditText(item.text || item.name);
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
                </View>
              );
            })
          )}
        </ScrollView>

        {/* SAVE BUTTON */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveList}>
          <Text style={styles.saveText}>Spasi listu</Text>
        </TouchableOpacity>
      </View>
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

  listTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#4A4A4A",
    marginBottom: 14,
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

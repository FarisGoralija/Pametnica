import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import HeaderWithBack from "../../components/HeaderWithBack";

const NewListScreen = () => {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack title="Nova Lista" subtitle="" />
      </View>

      {/* SEND TO PARENT BUTTON */}
      <View style={styles.sendWrapper}>
        <TouchableOpacity style={styles.sendButton} activeOpacity={0.8}>
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
          <Text style={styles.listTitle}>Lista 1</Text>

          <View style={styles.actions}>
            <MaterialCommunityIcons
              name="pencil"
              size={20}
              color="#5F5F5F"
              style={{ marginRight: 12 }}
            />
            <MaterialCommunityIcons
              name="trash-can"
              size={20}
              color="#E53935"
            />
          </View>
        </View>

        {/* EMPTY STATE */}
        <View style={styles.emptyState}>
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
              name="food-carrot"
              size={26}
              color="#FF8F00"
              style={styles.fruit2}
            />
            <MaterialCommunityIcons
              name="food-pear"
              size={24}
              color="#66BB6A"
              style={styles.fruit3}
            />
          </View>

          <Text style={styles.emptyText}>Nemate nijednu stavku na listi</Text>

          <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
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
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },

  sendText: {
    color: "#FFFFFF",
    fontSize: 13,
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
    fontSize: 20,
    fontWeight: "700",
    color: "#5F5F5F",
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
  },

  addText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default NewListScreen;

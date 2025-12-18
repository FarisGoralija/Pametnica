import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const AddItemModal = ({ visible, onClose, onAdd }) => {
  const [value, setValue] = useState("");

  const handleAdd = () => {
    const cleaned = value.trim();
    if (!cleaned) return;
    onAdd(cleaned);
    setValue("");
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.box}>
          <Text style={styles.title}>Upišite ime vaše stavke</Text>

          <View style={styles.inputRow}>
            <TextInput
              value={value}
              onChangeText={setValue}
              placeholder="Mlijeko"
              placeholderTextColor="#EAEAEA"
              style={styles.input}
              autoFocus
            />
            <MaterialCommunityIcons name="pencil" size={22} color="#fff" />
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleAdd}>
            <Text style={styles.btnText}>Uredu</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeArea} onPress={onClose}>
            <Text style={styles.closeText}>Zatvori</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  box: {
    width: "80%",
    backgroundColor: "#12C7E5",
    borderRadius: 16,
    padding: 16,
  },

  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7A7A7A",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
  },

  input: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    paddingVertical: 8,
  },

  btn: {
    backgroundColor: "#0BBAD3",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  closeArea: {
    marginTop: 10,
    alignItems: "center",
  },

  closeText: {
    color: "#EAF7F7",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default AddItemModal;

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
        <View style={styles.modal}>
          <Text style={styles.title}>Ime stavke</Text>

          <View style={styles.inputRow}>
            <TextInput
              value={value}
              onChangeText={setValue}
              placeholder="Upišite ime stavke"
              placeholderTextColor="#9E9E9E"
              style={styles.input}
              autoFocus
            />
            <MaterialCommunityIcons
              name="pencil-outline"
              size={20}
              color="#9E9E9E"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleAdd}>
            <Text style={styles.buttonText}>Dodaj</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Otkaži</Text>
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

  modal: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 18,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },

  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: "#111",
  },

  button: {
    backgroundColor: "#12C7E5", // isti accent kao RenameListModal
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  cancel: {
    marginTop: 12,
    alignItems: "center",
  },

  cancelText: {
    color: "#7D7D7D",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default AddItemModal;

import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const RenameListModal = ({ visible, onClose, onSave }) => {
  const [name, setName] = useState("");

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>List name</Text>

          <TextInput
            placeholder="Enter list name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              onSave(name);
              setName("");
              onClose();
            }}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 18,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#12C7E5",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});

export default RenameListModal;

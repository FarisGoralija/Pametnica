import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import HeaderWithBack from "../../components/HeaderWithBack";
import ProfileDetailRow from "../../components/ProfileDetailRow";
import { useAuth } from "../../context/AuthContext";
import { getMe, updateMe } from "../../api/endpoints";

const ProfileDetailsParentScreen = () => {
  const navigation = useNavigation();
  const { token } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalField, setModalField] = useState(null); // "firstName" | "lastName" | "email"
  const [modalValue, setModalValue] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setErrorMessage("");
    getMe(token)
      .then((data) => {
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setEmail(data.email || "");
      })
      .catch((err) =>
        setErrorMessage(
          err?.message || "Neuspješno učitavanje profila. Pokušajte ponovo."
        )
      )
      .finally(() => setLoading(false));
  }, [token]);

  const openModal = (field) => {
    setModalField(field);
    if (field === "firstName") setModalValue(firstName);
    else if (field === "lastName") setModalValue(lastName);
    else if (field === "email") setModalValue(email);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!token || !modalField) {
      setModalVisible(false);
      return;
    }
    const trimmed = modalValue.trim();
    if (!trimmed) {
      setModalVisible(false);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const payload =
        modalField === "firstName"
          ? { firstName: trimmed }
          : modalField === "lastName"
          ? { lastName: trimmed }
          : { email: trimmed };

      const updated = await updateMe(payload, token);
      setFirstName(updated.firstName || "");
      setLastName(updated.lastName || "");
      setEmail(updated.email || "");
    } catch (err) {
      setErrorMessage(err?.message || "Ažuriranje profila nije uspjelo.");
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack title="Detalji profila" subtitle="" />
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        {/* NAME */}
        <ProfileDetailRow
          label="Ime"
          value={firstName}
          leftIcon={
            <MaterialCommunityIcons
              name="account-outline"
              size={24}
              color="#FAFAFA"
            />
          }
          rightIcon={
            <MaterialCommunityIcons name="pencil" size={20} color="#FAFAFA" />
          }
          onPress={() => openModal("firstName")}
        />

        {/* SURNAME */}
        <ProfileDetailRow
          label="Prezime"
          value={lastName}
          leftIcon={
            <MaterialCommunityIcons
              name="account-outline"
              size={24}
              color="#FAFAFA"
            />
          }
          rightIcon={
            <MaterialCommunityIcons name="pencil" size={20} color="#FAFAFA" />
          }
          onPress={() => openModal("lastName")}
        />

        {/* EMAIL */}
        <ProfileDetailRow
          label="Email adresa"
          value={email}
          leftIcon={
            <MaterialCommunityIcons
              name="email-outline"
              size={24}
              color="#FAFAFA"
            />
          }
          rightIcon={
            <MaterialCommunityIcons name="pencil" size={20} color="#FAFAFA" />
          }
          onPress={() => openModal("email")}
        />
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
        {loading ? <Text style={styles.loadingText}>Učitavanje...</Text> : null}
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalField === "firstName"
                  ? "Unesite ime"
                  : modalField === "lastName"
                  ? "Unesite prezime"
                  : "Unesite e-mail"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              value={modalValue}
              onChangeText={setModalValue}
              placeholder={
                modalField === "firstName"
                  ? "Unesite ime"
                  : modalField === "lastName"
                  ? "Unesite prezime"
                  : "Unesite e-mail"
              }
              keyboardType={modalField === "email" ? "email-address" : "default"}
              autoCapitalize={modalField === "email" ? "none" : "words"}
            />

            <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
              <Text style={styles.modalButtonText}>Spasi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileDetailsParentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  headerWrapper: {
    marginTop: Platform.OS === "android" ? 20 : 80,
  },

  content: {
    marginTop: 30,
    paddingHorizontal: 20,
  },

  errorText: {
    marginTop: 12,
    color: "#E53935",
    fontSize: 14,
    textAlign: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#FAFAFA",
    fontSize: 14,
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  modalClose: {
    fontSize: 18,
    fontWeight: "700",
    color: "#444",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: "#3793F0",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

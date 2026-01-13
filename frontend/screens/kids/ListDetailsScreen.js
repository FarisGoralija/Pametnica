import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

import HeaderWithBack from "../../components/HeaderWithBack";
import { useAuth } from "../../context/AuthContext";
import { verifyShoppingItem, completeShoppingItem } from "../../api/endpoints";

const ListDetailsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { token } = useAuth();
  const { list, source } = route.params;

  // Determine if this is from active lists (show camera) or pending (no camera)
  const isActiveList = source === "active";

  // State for OCR verification
  const [verifyingItemId, setVerifyingItemId] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [completingItem, setCompletingItem] = useState(false);

  // Local state for items (to track completed ones)
  const [items, setItems] = useState(
    (list.items || []).map((item) => ({
      id: item.id || item.Id,
      name: item.text || item.Text || item.name || item.Name || "",
      isCompleted: item.isCompleted || item.IsCompleted || false,
      price: item.price || item.Price || null,
    }))
  );

  /**
   * Request camera permissions
   */
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Potrebna dozvola",
        "Molimo omogućite pristup kameri u postavkama uređaja kako biste mogli skenirati cjenovnike.",
        [{ text: "U redu" }]
      );
      return false;
    }
    return true;
  };

  /**
   * Handle camera button press
   * Opens camera and processes the captured image
   */
  const handleCameraPress = async (item) => {
    // Request camera permission
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8, // Balance between quality and size
        base64: true, // We need base64 for the OCR service
      });

      // User cancelled
      if (result.canceled) {
        return;
      }

      // Get the captured image
      const image = result.assets[0];
      if (!image.base64) {
        Alert.alert("Greška", "Nije moguće obraditi sliku. Pokušajte ponovo.");
        return;
      }

      // Start verification
      setVerifyingItemId(item.id);
      setSelectedItem(item);

      // Call OCR verification API
      const verifyResult = await verifyShoppingItem(
        list.id,
        item.id,
        image.base64,
        token
      );

      setVerificationResult(verifyResult);

      if (verifyResult.isMatch) {
        // Success! Show price input modal
        // Pre-fill with extracted price if available
        if (verifyResult.extractedPrice) {
          // Try to parse the extracted price (remove currency symbols, etc.)
          const priceMatch = verifyResult.extractedPrice.match(/[\d,\.]+/);
          if (priceMatch) {
            setPriceInput(priceMatch[0].replace(",", "."));
          }
        }
        setShowPriceModal(true);
      } else {
        // No match - show error message
        Alert.alert(
          "Proizvod ne odgovara",
          verifyResult.message ||
            "Slika cjenovnika ne odgovara odabranom artiklu. Molimo pokušajte ponovo.",
          [{ text: "U redu" }]
        );
      }
    } catch (error) {
      console.error("Camera/verification error:", error);
      Alert.alert(
        "Greška",
        error.message || "Došlo je do greške pri verifikaciji. Pokušajte ponovo."
      );
    } finally {
      setVerifyingItemId(null);
    }
  };

  /**
   * Handle completing the item after successful verification
   */
  const handleCompleteItem = async () => {
    if (!selectedItem || !priceInput) {
      Alert.alert("Greška", "Molimo unesite cijenu.");
      return;
    }

    const price = parseFloat(priceInput.replace(",", "."));
    if (isNaN(price) || price <= 0) {
      Alert.alert("Greška", "Molimo unesite ispravnu cijenu.");
      return;
    }

    setCompletingItem(true);

    try {
      await completeShoppingItem(list.id, selectedItem.id, price, token);

      // Update local state to mark item as completed
      setItems((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? { ...item, isCompleted: true, price }
            : item
        )
      );

      Alert.alert(
        "Uspješno!",
        `Artikal "${selectedItem.name}" je označen kao kupljen.`,
        [{ text: "U redu" }]
      );

      // Close modal and reset state
      setShowPriceModal(false);
      setPriceInput("");
      setSelectedItem(null);
      setVerificationResult(null);
    } catch (error) {
      console.error("Complete item error:", error);
      Alert.alert(
        "Greška",
        error.message || "Nije moguće označiti artikal kao kupljen."
      );
    } finally {
      setCompletingItem(false);
    }
  };

  /**
   * Close price modal and reset state
   */
  const handleClosePriceModal = () => {
    setShowPriceModal(false);
    setPriceInput("");
    setSelectedItem(null);
    setVerificationResult(null);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack
          title="Detalji liste"
          onBack={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: "ListsMain" }],
            })
          }
        />
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
          {items.length === 0 ? (
            <Text style={styles.emptyText}>Ova lista nema stavki</Text>
          ) : (
            items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                {/* Check icon - green if completed */}
                <MaterialCommunityIcons
                  name={item.isCompleted ? "check-circle" : "check-circle-outline"}
                  size={26}
                  color={item.isCompleted ? "#4CAF50" : "#12C7E5"}
                />

                {/* Item name */}
                <Text
                  style={[
                    styles.itemText,
                    item.isCompleted && styles.itemTextCompleted,
                  ]}
                >
                  {item.name}
                </Text>

                {/* Price if completed */}
                {item.isCompleted && item.price && (
                  <Text style={styles.priceText}>
                    {item.price.toFixed(2)} KM
                  </Text>
                )}

                {/* Camera button - only for active lists and uncompleted items */}
                {isActiveList && !item.isCompleted && (
                  <TouchableOpacity
                    style={styles.cameraButton}
                    onPress={() => handleCameraPress(item)}
                    disabled={verifyingItemId !== null}
                  >
                    {verifyingItemId === item.id ? (
                      <ActivityIndicator size="small" color="#12C7E5" />
                    ) : (
                      <Text style={styles.cameraEmoji}>📷</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* PRICE INPUT MODAL */}
      <Modal
        visible={showPriceModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClosePriceModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Success header */}
            <View style={styles.modalHeader}>
              <Text style={styles.successEmoji}>✅</Text>
              <Text style={styles.modalTitle}>Proizvod potvrđen!</Text>
            </View>

            {/* Verification result info */}
            {verificationResult && (
              <View style={styles.resultInfo}>
                <Text style={styles.resultLabel}>Prepoznat tekst:</Text>
                <Text style={styles.resultText} numberOfLines={2}>
                  {verificationResult.ocrText || "N/A"}
                </Text>
                <Text style={styles.confidenceText}>
                  Pouzdanost: {(verificationResult.confidence * 100).toFixed(0)}%
                </Text>
              </View>
            )}

            {/* Price input */}
            <Text style={styles.priceLabel}>Unesite cijenu (KM):</Text>
            <TextInput
              style={styles.priceInputField}
              value={priceInput}
              onChangeText={setPriceInput}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#999"
            />

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClosePriceModal}
              >
                <Text style={styles.cancelButtonText}>Odustani</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  completingItem && styles.buttonDisabled,
                ]}
                onPress={handleCompleteItem}
                disabled={completingItem}
              >
                {completingItem ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Potvrdi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flex: 1,
    marginBottom: 20,
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
    color: "#4A4A4A",
  },

  itemTextCompleted: {
    textDecorationLine: "line-through",
    color: "#8A8A8A",
  },

  priceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4CAF50",
    marginRight: 8,
  },

  cameraButton: {
    padding: 8,
    marginLeft: 4,
  },

  cameraEmoji: {
    fontSize: 24,
  },

  emptyText: {
    fontSize: 14,
    color: "#8A8A8A",
    textAlign: "center",
    paddingVertical: 20,
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    elevation: 5,
  },

  modalHeader: {
    alignItems: "center",
    marginBottom: 16,
  },

  successEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4A4A4A",
  },

  resultInfo: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  resultLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },

  resultText: {
    fontSize: 14,
    color: "#333",
    fontStyle: "italic",
  },

  confidenceText: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 8,
    fontWeight: "600",
  },

  priceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 8,
  },

  priceInputField: {
    borderWidth: 2,
    borderColor: "#12C7E5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
    marginRight: 8,
    alignItems: "center",
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },

  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    marginLeft: 8,
    alignItems: "center",
  },

  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  buttonDisabled: {
    opacity: 0.6,
  },
});

export default ListDetailsScreen;

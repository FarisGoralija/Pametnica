import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

import HeaderWithBack from "../../components/HeaderWithBack";
import { useAuth } from "../../context/AuthContext";
import {
  verifyShoppingItem,
  completeShoppingItem,
  deleteShoppingList,
  getChildActiveLists,
  getChildPendingLists,
} from "../../api/endpoints";

const ListDetailsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { token } = useAuth();
  const { list, source } = route.params;

  // Determine if this is from active lists (show camera) or pending (no camera)
  const isActiveList = source === "active";

  // State for OCR verification
  const [verifyingItemId, setVerifyingItemId] = useState(null);
  const [completingItemId, setCompletingItemId] = useState(null);

  // State for error modal (when OCR doesn't match)
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // State for completing list
  const [completingList, setCompletingList] = useState(false);

  // Local state for items (to track completed ones and pending prices)
  const [items, setItems] = useState(
    (list.items || []).map((item) => ({
      id: item.id || item.Id,
      name: item.text || item.Text || item.name || item.Name || "",
      isCompleted: item.isCompleted || item.IsCompleted || false,
      price: item.price || item.Price || null,
      isVerified: item.isCompleted || item.IsCompleted || false,
      pendingPrice: "",
    }))
  );

  const refreshFromApi = useCallback(async () => {
    if (!token) return;
    try {
      const [activeRes, pendingRes] = await Promise.all([
        getChildActiveLists(token),
        getChildPendingLists(token),
      ]);
      const combined = [
        ...(Array.isArray(activeRes) ? activeRes : []),
        ...(Array.isArray(pendingRes) ? pendingRes : []),
      ];
      const latest = combined.find(
        (l) => (l.id || l.Id || "").toString() === (list.id || list.Id || "").toString()
      );
      if (latest && latest.items) {
        setItems(
          latest.items.map((item) => ({
            id: item.id || item.Id,
            name: item.text || item.Text || item.name || item.Name || "",
            isCompleted: item.isCompleted || item.IsCompleted || false,
            price: item.price || item.Price || null,
            isVerified: item.isCompleted || item.IsCompleted || false,
            pendingPrice: "",
          }))
        );
      }
    } catch (err) {
      // soft-fail; keep local state
      console.warn("Failed to refresh list details", err);
    }
  }, [token, list.id, list.Id]);

  useFocusEffect(
    useCallback(() => {
      refreshFromApi();
    }, [refreshFromApi])
  );

  // Calculate total price of completed items
  const totalPrice = items
    .filter((item) => item.isCompleted && item.price)
    .reduce((sum, item) => sum + item.price, 0);

  // Check if all items are completed with prices
  const allItemsCompleted =
    items.length > 0 && items.every((item) => item.isCompleted && item.price);

  /**
   * Request camera permissions
   */
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      setErrorMessage(
        "Molimo omogućite pristup kameri u postavkama uređaja kako biste mogli skenirati cjenovnike."
      );
      setShowErrorModal(true);
      return false;
    }
    return true;
  };

  /**
   * Handle camera button press
   * Opens camera and processes the captured image
   */
  const handleCameraPress = async (item) => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (result.canceled) return;

      const image = result.assets[0];
      if (!image.base64) {
        setErrorMessage("Nije moguće obraditi sliku. Pokušajte ponovo.");
        setShowErrorModal(true);
        return;
      }

      // Start verification
      setVerifyingItemId(item.id);

      // Call OCR verification API
      const verifyResult = await verifyShoppingItem(
        list.id,
        item.id,
        image.base64,
        token
      );

      if (verifyResult.isMatch) {
        // SUCCESS! Mark item as verified and allow price input
        let suggestedPrice = "";
        if (verifyResult.extractedPrice) {
          const priceMatch = verifyResult.extractedPrice.match(/[\d,\.]+/);
          if (priceMatch) {
            suggestedPrice = priceMatch[0].replace(",", ".");
          }
        }

        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, isVerified: true, pendingPrice: suggestedPrice }
              : i
          )
        );
      } else {
        // NO MATCH - show error modal
        setErrorMessage(
          verifyResult.message ||
            "Slika cjenovnika ne odgovara odabranom artiklu. Molimo pokušajte ponovo sa ispravnim proizvodom."
        );
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Camera/verification error:", error);
      setErrorMessage(
        error.message || "Došlo je do greške pri verifikaciji. Pokušajte ponovo."
      );
      setShowErrorModal(true);
    } finally {
      setVerifyingItemId(null);
    }
  };

  /**
   * Handle price input change for a verified item
   */
  const handlePriceChange = (itemId, value) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, pendingPrice: value } : i))
    );
  };

  /**
   * Confirm price and complete the item
   */
  const handleConfirmPrice = async (item) => {
    const price = parseFloat(item.pendingPrice.replace(",", "."));
    if (isNaN(price) || price <= 0) {
      setErrorMessage("Molimo unesite ispravnu cijenu.");
      setShowErrorModal(true);
      return;
    }

    setCompletingItemId(item.id);

    try {
      await completeShoppingItem(list.id, item.id, price, token);

      // Update local state to mark item as completed
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, isCompleted: true, price, pendingPrice: "" }
            : i
        )
      );
    } catch (error) {
      console.error("Complete item error:", error);
      setErrorMessage(
        error.message || "Nije moguće označiti artikal kao kupljen."
      );
      setShowErrorModal(true);
    } finally {
      setCompletingItemId(null);
    }
  };

  /**
   * Complete the entire list
   * Balance deduction and points are handled by the backend when the last item is completed
   * We just need to delete the list after
   */
  const handleCompleteList = async () => {
    setCompletingList(true);

    try {
      // Delete the list
      await deleteShoppingList(list.id, token);

      // Navigate back to lists
      Alert.alert(
        "Kupovina završena! 🎉",
        `Ukupno potrošeno: ${totalPrice.toFixed(2)} KM\nDobili ste 10 bodova!`,
        [
          {
            text: "U redu",
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: "ListsMain" }],
              }),
          },
        ]
      );
    } catch (error) {
      console.error("Complete list error:", error);
      
      // Check if it's an insufficient balance error
      const errorMsg = error.message || "";
      if (errorMsg.includes("Insufficient balance") || errorMsg.includes("nedovoljno") || errorMsg.includes("balance")) {
        setErrorMessage("You do not have enough money.");
      } else {
        setErrorMessage(errorMsg || "Nije moguće završiti kupovinu. Pokušajte ponovo.");
      }
      
      setShowErrorModal(true);
    } finally {
      setCompletingList(false);
    }
  };

  /**
   * Close error modal
   */
  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
  };

  /**
   * Render a single item card
   */
  const renderItemCard = (item) => {
    const isVerifying = verifyingItemId === item.id;
    const isConfirming = completingItemId === item.id;

    // COMPLETED ITEM - Green card with price
    if (item.isCompleted) {
      return (
        <View key={item.id} style={styles.itemRowCompleted}>
          <MaterialCommunityIcons
            name="check-circle"
            size={26}
            color="#FFFFFF"
          />
          <Text style={styles.itemTextCompleted}>{item.name}</Text>
          <Text style={styles.priceTextCompleted}>
            {item.price?.toFixed(2)} KM
          </Text>
        </View>
      );
    }

    // VERIFIED ITEM (awaiting price input) - Green card with price input
    if (item.isVerified) {
      return (
        <View key={item.id} style={styles.itemRowVerified}>
          <View style={styles.verifiedHeader}>
            <MaterialCommunityIcons
              name="check-circle"
              size={22}
              color="#FFFFFF"
            />
            <Text style={styles.itemTextVerified}>{item.name}</Text>
          </View>

          <View style={styles.priceInputRow}>
            <TextInput
              style={styles.inlinePriceInput}
              value={item.pendingPrice}
              onChangeText={(value) => handlePriceChange(item.id, value)}
              keyboardType="decimal-pad"
              placeholder="Cijena (KM)"
              placeholderTextColor="#A5D6A7"
            />
            <TouchableOpacity
              style={[
                styles.confirmPriceButton,
                isConfirming && styles.buttonDisabled,
              ]}
              onPress={() => handleConfirmPrice(item)}
              disabled={isConfirming}
            >
              {isConfirming ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <MaterialCommunityIcons name="check" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // NORMAL ITEM - White card with camera button
    return (
      <View key={item.id} style={styles.itemRow}>
        <MaterialCommunityIcons
          name="checkbox-blank-circle-outline"
          size={26}
          color="#12C7E5"
        />
        <Text style={styles.itemText}>{item.name}</Text>

        {/* Camera button - only for active lists */}
        {isActiveList && (
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => handleCameraPress(item)}
            disabled={verifyingItemId !== null}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color="#12C7E5" />
            ) : (
              <Text style={styles.cameraEmoji}>📷</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

          {/* ITEMS - Max 4 visible, scrollable if more */}
          <View style={styles.itemsContainer}>
            <ScrollView
              style={styles.itemsScrollView}
              contentContainerStyle={styles.itemsWrapper}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {items.length === 0 ? (
                <Text style={styles.emptyText}>Ova lista nema stavki</Text>
              ) : (
                items.map((item) => renderItemCard(item))
              )}
            </ScrollView>
          </View>
        </View>

        {/* TOTAL & COMPLETE BUTTON - Only for active lists */}
        {isActiveList && items.length > 0 && (
          <View style={styles.bottomSection}>
            {/* TOTAL */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Ukupno:</Text>
              <Text style={styles.totalValue}>{totalPrice.toFixed(2)} KM</Text>
            </View>

            {/* COMPLETE LIST BUTTON */}
            {allItemsCompleted && (
              <TouchableOpacity
                style={[
                  styles.completeListButton,
                  completingList && styles.buttonDisabled,
                ]}
                onPress={handleCompleteList}
                disabled={completingList}
              >
                {completingList ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="cart-check"
                      size={24}
                      color="#FFFFFF"
                    />
                    <Text style={styles.completeListButtonText}>
                      Završi kupovinu
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* ERROR MODAL */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseErrorModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Error header */}
            <View style={styles.modalHeader}>
              <Text style={styles.errorEmoji}>❌</Text>
              <Text style={styles.modalTitle}>
                {errorMessage === "You do not have enough money." 
                  ? "Nedovoljno novca" 
                  : "Neuspješna verifikacija"}
              </Text>
            </View>

            {/* Error message */}
            <Text style={styles.errorMessageText}>{errorMessage}</Text>

            {/* Close button - OK for insufficient balance, Zatvori for others */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseErrorModal}
            >
              <Text style={styles.closeButtonText}>
                {errorMessage === "You do not have enough money." ? "OK" : "Zatvori"}
              </Text>
            </TouchableOpacity>
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

  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: Platform.OS === "ios" ? 90 : 70, // Space for tab navigator
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

  itemsContainer: {
    // No flex here - let it size naturally
  },

  itemsScrollView: {
    maxHeight: 320, // ~4 items visible (each item ~70px + spacing)
  },

  itemsWrapper: {
    backgroundColor: "#FFFDF8",
    borderRadius: 18,
    padding: 16,
    paddingBottom: 8,
  },

  /* NORMAL ITEM */
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#12C7E5",
  },

  itemText: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 10,
    color: "#4A4A4A",
  },

  cameraButton: {
    padding: 8,
    marginLeft: 4,
  },

  cameraEmoji: {
    fontSize: 24,
  },

  /* VERIFIED ITEM (green, awaiting price) */
  itemRowVerified: {
    backgroundColor: "#4CAF50",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  verifiedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  itemTextVerified: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 10,
    color: "#FFFFFF",
  },

  priceInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  inlinePriceInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 10,
  },

  confirmPriceButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
  },

  /* COMPLETED ITEM (green, with price) */
  itemRowCompleted: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  itemTextCompleted: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 10,
    color: "#FFFFFF",
  },

  priceTextCompleted: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  emptyText: {
    fontSize: 14,
    color: "#8A8A8A",
    textAlign: "center",
    paddingVertical: 20,
  },

  /* BOTTOM SECTION */
  bottomSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 12,
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A4A4A",
  },

  totalValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#4CAF50",
  },

  completeListButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 14,
    paddingVertical: 16,
    elevation: 3,
  },

  completeListButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 10,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  /* ERROR MODAL */
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

  errorEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4A4A4A",
    textAlign: "center",
  },

  errorMessageText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },

  closeButton: {
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4A4A",
  },
});

export default ListDetailsScreen;

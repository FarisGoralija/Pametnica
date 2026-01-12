import React, { useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import {
  useNavigation,
  useRoute,
  CommonActions,
} from "@react-navigation/native";

import HeaderWithBack from "../../components/HeaderWithBack";
import CustomInput from "../../components/CustomInput";
import NextButton from "../../components/NextButton";
import { updateChildAllowance } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useChildren } from "../../context/ChildrenContext";

const SetBudgetAmountScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAuth();
  const { refreshChildren } = useChildren();

  const { childId } = route.params;

  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const parsedBudget = parseFloat(budget.replace(",", "."));
  const isDisabled =
    !budget || Number.isNaN(parsedBudget) || parsedBudget < 0 || loading;

  const handleSaveBudget = async () => {
    setErrorMessage("");
    if (isDisabled) return;

    setLoading(true);
    try {
      await updateChildAllowance(childId, parsedBudget, token);
      await refreshChildren({ force: true });

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "ProfileParentMain" }],
        })
      );
    } catch (err) {
      const msg =
        err?.message || "Ažuriranje mjesečnog budžeta nije uspjelo.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack
          title="Mjesečni budžet"
          subtitle="Unesite iznos mjesečnog budžeta"
        />
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.label}>Iznos budžeta (KM)</Text>

        <CustomInput
          placeholder="npr. 50"
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
          iconName="cash"
        />

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <NextButton
          title={loading ? "Spremanje..." : "Sačuvaj"}
          onPress={handleSaveBudget}
          isDisabled={isDisabled}
        />
      </View>
    </View>
  );
};

export default SetBudgetAmountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  headerWrapper: {
    marginTop: Platform.OS === "android" ? 20 : 80,
  },

  content: {
    marginTop: 40,
    paddingHorizontal: 40,
    alignItems: "center",
  },

  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    color: "#7D7D7D",
    fontFamily: "SFCompactRounded-Regular",
    marginBottom: 10,
  },

  errorText: {
    width: "100%",
    color: "#E53935",
    fontSize: 14,
    fontFamily: "SFCompactRounded-Regular",
    marginTop: 10,
    marginBottom: 10,
    textAlign: "left",
  },
});

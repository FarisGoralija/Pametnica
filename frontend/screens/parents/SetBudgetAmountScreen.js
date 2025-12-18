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

const SetBudgetAmountScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { childId } = route.params;

  const [budget, setBudget] = useState("");

  const isDisabled = !budget;

  const handleSaveBudget = () => {
    // here you will later save the budget (context / backend)

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "ProfileParentMain" }],
      })
    );
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

        <NextButton
          title="Sačuvaj"
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
});

import React, { useState } from "react";
import { View, StyleSheet, Platform, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";

import HeaderWithBack from "../../components/HeaderWithBack";
import CustomInput from "../../components/CustomInput";
import NextButton from "../../components/NextButton";

const SetBudgetAmountScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(false);

  const handleChange = (text) => {
    if (/^\d*$/.test(text)) {
      setAmount(text);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleNext = () => {
    if (!amount) {
      setError(true);
      return;
    }

    // 🔹 SAVE BUDGET (later backend)
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <HeaderWithBack
          title="Postavi mjesečni budžet"
          subtitle="Upišite koliko novca dobijate ovaj mjesec za vaše dijete"
        />
      </View>

      <View style={styles.content}>
        <CustomInput
          placeholder="Iznos"
          value={amount}
          onChangeText={handleChange}
          iconName="wallet-outline"
          keyboardType="number-pad"
          error={error}
        />

        {error && (
          <Text style={styles.errorText}>
            Unos mora biti isključivo broj, ne slova
          </Text>
        )}

        <NextButton title="Dalje" onPress={handleNext} isDisabled={!amount} />
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

  content: {
    marginTop: 40,
    alignItems: "center",
  },

  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: "#E53935",
    fontFamily: "SFCompactRounded-Regular",
  },
});

export default SetBudgetAmountScreen;

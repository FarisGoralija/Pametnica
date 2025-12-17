import React, { useState } from "react";
import { View, StyleSheet, Platform, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";

import HeaderWithBack from "../components/HeaderWithBack";
import CustomInput from "../components/CustomInput";
import NextButton from "../components/NextButton";

const RemovePointsAmountScreen = () => {
  const navigation = useNavigation();

  const [points, setPoints] = useState("");
  const [error, setError] = useState(false);

  const handleChange = (text) => {
    if (/^\d*$/.test(text)) {
      setPoints(text);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleNext = () => {
    if (!points) {
      setError(true);
      return;
    }

    // 🔹 SAVE POINTS REDUCTION (later backend)
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <HeaderWithBack
          title="Skini bodove"
          subtitle="Upiši koliko bodova želiš skinuti"
        />
      </View>

      <View style={styles.content}>
        <CustomInput
          placeholder="Broj bodova"
          value={points}
          onChangeText={handleChange}
          iconName="minus-circle-outline"
          keyboardType="number-pad"
          error={error}
        />

        {error && (
          <Text style={styles.errorText}>Unos mora biti isključivo broj</Text>
        )}

        <NextButton title="Dalje" onPress={handleNext} isDisabled={!points} />
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

export default RemovePointsAmountScreen;

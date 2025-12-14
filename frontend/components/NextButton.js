// components/NextButton.js

import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const NextButton = ({ title = "Dalje", onPress, isDisabled = false }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDisabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 300,               // ✅ FIXED WIDTH (matches inputs)
    height: 52,               // ✅ FIXED HEIGHT (Android-safe)
    borderRadius: 16,
    backgroundColor: "#7CCDD4",
    alignItems: "center",
    justifyContent: "center",

    // ✅ SHADOW (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,

    // ✅ SHADOW (Android)
    elevation: 5,
  },

  buttonDisabled: {
    backgroundColor: "#C0EAF0",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 22,             // ✅ slightly smaller for vertical centering
    fontFamily: "SFCompactRounded-Bold",
    textAlignVertical: "center",
  },
});

export default NextButton;

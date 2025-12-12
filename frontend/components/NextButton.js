// components/NextButton.js

import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const NextButton = ({ title = "Dalje", onPress, isDisabled = false }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDisabled && styles.buttonDisabled, // Apply disabled style if needed
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    maxWidth: 300, // Limit width for better appearance on tablets
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: "#7CCDD4", // Primary light green color (matching your header)
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#C0EAF0", // Lighter shade for disabled state
  },
  buttonText: {
    color: "#FFFFFF", // White text
    fontSize: 26,
    fontWeight: "700",
  },
});

export default NextButton;

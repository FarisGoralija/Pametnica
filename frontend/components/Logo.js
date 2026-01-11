// components/Logo.js

import React from "react";
import { Text, StyleSheet } from "react-native";

const Logo = () => {
  return <Text style={styles.logoText}>Pametnica</Text>;
};

const styles = StyleSheet.create({
  logoText: {
    fontSize: 50,
    fontFamily: 'SFCompactRounded-Bold',
    color: "#B0E5DD", // Using a light green color that matches your header
    marginBottom: 50, // Space below the logo
  },
});

export default Logo;

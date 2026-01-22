// components/Logo.js

import React from "react";
import { Text, StyleSheet } from "react-native";

const Logo = () => {
  return <Text style={styles.logoText}>Planiraj i Kupi</Text>;
};

const styles = StyleSheet.create({
  logoText: {
    fontSize: 40,
    fontFamily: 'SFCompactRounded-Bold',
    color: "#2787CC", // Using a light green color that matches your header
    marginBottom: 50, // Space below the logo
  },
});

export default Logo;

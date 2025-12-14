import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const HeaderWithBack = ({ title, subtitle }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 50,
    paddingTop: 60,
  },

  backButton: {
    position: "absolute",
    top: 25,
    left: 20,
    width: 37,
    height: 47,
    justifyContent: "center",
    alignItems: "center",
  },

  backIcon: {
    fontSize: 50,
    color: "#B0E5DD",
  },

  textContainer: {
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    color: "#B0E5DD",
    marginBottom: 8,
    fontFamily: "SFCompactRounded-Bold",
  },

  subtitle: {
    fontSize: 15,
    color: "#AFAFAF",
    textAlign: "center",
    fontFamily: "SFCompactRounded-Semibold",
  },
});

export default HeaderWithBack;

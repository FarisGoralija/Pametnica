import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const ActionSquare = ({ title, icon, backgroundColor, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.card, { backgroundColor }]}
      onPress={onPress}
    >
      {icon}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 140,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  text: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
});

export default ActionSquare;

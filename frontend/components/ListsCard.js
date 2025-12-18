import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const ListsCard = ({
  title,
  emptyText,
  buttonText,
  onCreatePress,
  backgroundColor,
  icon,
}) => {
  return (
    <View style={[styles.card, { backgroundColor }]}>
      {icon}
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.empty}>{emptyText}</Text>

      <TouchableOpacity style={styles.button} onPress={onCreatePress}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 20,
    alignItems: "center",
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginVertical: 12,
  },
  empty: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.85,
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonText: {
    fontWeight: "600",
  },
});

export default ListsCard;

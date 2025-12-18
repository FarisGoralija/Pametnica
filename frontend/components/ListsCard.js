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
      {/* TOP LEFT TITLE */}
      <Text style={styles.title}>{title}</Text>

      {/* CENTER CONTENT */}
      <View style={styles.center}>
        {icon}

        <Text style={styles.empty}>{emptyText}</Text>

        <TouchableOpacity style={styles.button} onPress={onCreatePress}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 20,
    height: 260,
    position: "relative",
    elevation: 3,
  },

  title: {
    position: "absolute",
    top: 16,
    left: 16,
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
  },

  empty: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.85,
    marginTop: 12,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "600",
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },

  buttonText: {
    fontWeight: "600",
    color: "#000",
  },
});

export default ListsCard;

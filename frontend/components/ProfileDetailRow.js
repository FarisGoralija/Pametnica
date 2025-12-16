import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const ProfileDetailRow = ({
  label,
  value,
  leftIcon,
  rightIcon,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.left}>
        {leftIcon}

        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>

      {rightIcon && <View>{rightIcon}</View>}
    </TouchableOpacity>
  );
};

export default ProfileDetailRow;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#C0EAF0",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  textContainer: {
    marginLeft: 14,
  },

  label: {
    fontSize: 12,
    fontFamily: "SFCompactRounded-Regular",
    color: "#7D7D7D",
    marginBottom: 2,
  },

  value: {
    fontSize: 16,
    fontFamily: "SFCompactRounded-Semibold",
    color: "#4A4A4A",
  },
});

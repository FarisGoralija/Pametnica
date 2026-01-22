import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const ProfileOptionRow = ({ icon, text, onPress, textColor }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.row}>
        {icon}
        <Text style={[styles.text, textColor && { color: textColor }]}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ProfileOptionRow;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#56A0E3",
    borderRadius: 10,
    paddingHorizontal: 16,
    minHeight: 60, // ✅ flexible height
    justifyContent: "center",
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  text: {
    fontSize: 16,
    fontFamily: "SFCompactRounded-Regular",
    color: "#FAFAFA",
    marginLeft: 14,
  },
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const RoleCard = ({
  title,
  icon,
  iconName,
  iconSize = 40,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selectedCard]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* ICON */}
      <View style={styles.iconWrapper}>
        {icon ? (
          icon
        ) : iconName ? (
          <MaterialCommunityIcons
            name={iconName}
            size={iconSize}
            color="#FFFFFF"
          />
        ) : null}
      </View>

      {/* TITLE */}
      <Text style={styles.title} allowFontScaling={false}>
        {title}
      </Text>

      {/* RADIO INDICATOR */}
      <View style={styles.radioWrapper}>
        <View
          style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}
        >
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RoleCard;

const styles = StyleSheet.create({
  card: {
    width: 140,
    height: 200,
    backgroundColor: "#3793F0",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    position: "relative",
  },

  selectedCard: {
    borderWidth: 2,
    borderColor: "#000000",
  },

  iconWrapper: {
    marginBottom: 14,
  },

  title: {
    fontSize: 17,
    fontFamily: "SFCompactRounded-Semibold",
    color: "#FAFAFA",
  },

  /* RADIO */
  radioWrapper: {
    position: "absolute",
    bottom: 14,
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#7D7D7D",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  radioOuterSelected: {
    borderColor: "#000000",
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#000000",
  },
});

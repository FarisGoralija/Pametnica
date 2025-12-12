// components/RoleCard.js

import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const RoleCard = ({ title, iconName, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.title}>{title}</Text>

      {/* Icon Area - Using MaterialCommunityIcons for simplicity */}
      {/* You can replace this with your parent.svg or other image component */}
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons
          name={iconName}
          size={55}
          color={styles.title.color} // Use the same color as text
        />
        {/* If using your own image: */}
        {/* <Image source={iconSource} style={styles.imageIcon} /> */}
      </View>

      {/* Custom Radio Button Indicator */}
      <View style={styles.radioOuter}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // --- CARD STYLING ---
  card: {
    backgroundColor: "#C0EAF0", // Light blue background matching the image
    borderRadius: 15,
    padding: 20,
    width: 140, // Fixed width for consistent layout
    height: 200, // Fixed height
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#C0EAF0",
  },
  cardSelected: {
    borderColor: "#7D7D7D", // A noticeable border color when selected
  },

  // --- CONTENT STYLING ---
  title: {
  fontSize: 18,
  fontWeight: '600',
  color: '#7D7D7D',
  marginBottom: 10,
  fontFamily: 'SFCompactRounded-Bold', // <-- add this
},

  iconWrapper: {
    flex: 1, // Allows the icon to take up the middle space
    justifyContent: "center",
    alignItems: "center",
  },
  // If you use an Image component, use this style:
  // imageIcon: {
  //   width: 60,
  //   height: 60,
  //   resizeMode: 'contain'
  // },

  // --- RADIO BUTTON STYLING ---
  radioOuter: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#7D7D7D",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  radioInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: "#7D7D7D", // Solid circle when selected
  },
});

export default RoleCard;

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";

const ProfileDetailRow = ({ label, value, leftIcon, rightIcon, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.left}>
        {leftIcon}

        <View style={styles.textContainer}>
          <Text
            style={styles.label}
            allowFontScaling={false}
            includeFontPadding={false}
          >
            {label}
          </Text>

          <Text
            style={styles.value}
            allowFontScaling={false}
            includeFontPadding={false}
          >
            {value}
          </Text>
        </View>
      </View>

      {rightIcon && <View>{rightIcon}</View>}
    </TouchableOpacity>
  );
};

export default ProfileDetailRow;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#56A0E3",
    borderRadius: 10,
    paddingHorizontal: 16,

    // 🔥 reduced vertical padding
    paddingVertical: Platform.OS === "android" ? 8 : 12,

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
    lineHeight: 14, // 🔥 VERY IMPORTANT
    fontFamily: "SFCompactRounded-Regular",
    color: "#FAFAFA",
    marginBottom: 2,
  },

  value: {
    fontSize: 16,
    lineHeight: 18, // 🔥 VERY IMPORTANT
    fontFamily: "SFCompactRounded-Semibold",
    color: "#FAFAFA",
  },
});

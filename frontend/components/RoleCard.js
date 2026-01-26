import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const RoleCard = ({
  title,
  icon,
  iconName,
  iconSize = 40,
  isSelected,
  onPress,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  const animatedStyle = useMemo(
    () => ({
      transform: [{ scale }],
      shadowOpacity: glow.interpolate({
        inputRange: [0, 1],
        outputRange: [0.1, 0.3],
      }),
      elevation: glow.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 7],
      }),
    }),
    [glow, scale]
  );

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isSelected ? 1.04 : 1,
      useNativeDriver: false,
      friction: 7,
      tension: 140,
    }).start();

    Animated.timing(glow, {
      toValue: isSelected ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [glow, isSelected, scale]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: false,
      friction: 6,
      tension: 120,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: isSelected ? 1.04 : 1,
      useNativeDriver: false,
      friction: 7,
      tension: 140,
    }).start();
  };

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selectedCard]}
      activeOpacity={0.7}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.cardInner, animatedStyle]}>
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
      </Animated.View>
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
    padding: 0,
  },

  selectedCard: {
    borderWidth: 2,
    borderColor: "#000000",
  },

  cardInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
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

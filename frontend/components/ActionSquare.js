import React, { useMemo, useRef } from "react";
import {
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";

const ActionSquare = ({ title, icon, backgroundColor, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animatedStyle = useMemo(
    () => ({
      transform: [{ scale }],
    }),
    [scale]
  );

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: false,
      friction: 6,
      tension: 120,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: false,
      friction: 8,
      tension: 120,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={[styles.card, animatedStyle, { backgroundColor }]}>
        {icon}
        <Text style={styles.text}>{title}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
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

import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ProfileCard = ({
  name,
  points,
  balanceLabel,
  balanceValue,
  avatarIcon,
  rightIcon,
  backgroundColor,
}) => {
  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.left}>
        <View style={styles.avatar}>{avatarIcon}</View>

        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.points}>{points}</Text>
          <Text style={styles.balance}>
            {balanceLabel}: {balanceValue}
          </Text>
        </View>
      </View>

      {rightIcon && <View>{rightIcon}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  name: {
    fontSize: 19,
    fontWeight: "600",
    color: "#fff",
  },
  points: {
    fontSize: 17,
    color: "#fff",
    opacity: 0.9,
  },
  balance: {
    fontSize: 15,
    color: "#fff",
    opacity: 0.8,
  },
});

export default ProfileCard;

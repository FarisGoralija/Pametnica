import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ProfileCard = ({
  name,
  points,
  balanceLabel,
  balanceValue, // number, not string
  maxBalance = 200,
  avatarIcon,
  rightIcon,
  backgroundColor,
}) => {
  const percentage = Math.min(balanceValue / maxBalance, 1);

  const getBarColor = () => {
    if (percentage >= 0.6) return "#4CAF50"; // green
    if (percentage >= 0.3) return "#FF9800"; // orange
    return "#F44336"; // red
  };

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.left}>
        <View style={styles.avatar}>{avatarIcon}</View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.points}>{points}</Text>

          <Text style={styles.balance}>
            {balanceLabel}: {balanceValue} KM
          </Text>

          {/* BAR */}
          <View style={styles.barContainer}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${percentage * 100}%`,
                  backgroundColor: getBarColor(),
                },
              ]}
            />
          </View>
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
    flex: 1,
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
    opacity: 0.85,
    marginBottom: 6,
  },

  /* BAR STYLES */
  barContainer: {
    height: 8,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
});

export default ProfileCard;

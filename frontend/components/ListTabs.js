import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ListTabs = ({ activeTab, onChange }) => {
  return (
    <View style={styles.container}>
      <Tab
        label="Aktivne"
        active={activeTab === "active"}
        onPress={() => onChange("active")}
      />
      <Tab
        label="Čekanje"
        active={activeTab === "waiting"}
        onPress={() => onChange("waiting")}
      />
    </View>
  );
};

const Tab = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.tab, active && styles.activeTab]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[styles.text, active && styles.activeText]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 6,
  },
  activeTab: {
    backgroundColor: "#12C7E5",
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: "#777",
  },
  activeText: {
    color: "#fff",
  },
});

export default ListTabs;

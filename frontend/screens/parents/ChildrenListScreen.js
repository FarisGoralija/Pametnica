import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

import HeaderWithBack from "../../components/HeaderWithBack";

const ChildrenListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [children, setChildren] = useState([]);

  // ✅ ADD CHILD WHEN COMING BACK FROM ADD SCREEN
  useEffect(() => {
    if (route.params?.newChild) {
      setChildren((prev) => [...prev, route.params.newChild]);
    }
  }, [route.params?.newChild]);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack title="Tvoja djeca" subtitle="" />
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        {children.length === 0 ? (
          // EMPTY STATE
          <TouchableOpacity
            style={styles.addEmpty}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("AddChild")}
          >
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={40}
              color="#7D7D7D"
            />
            <Text style={styles.addEmptyText}>Dodaj dijete</Text>
          </TouchableOpacity>
        ) : (
          <>
            {/* CHILD CARDS */}
            {children.map((child, index) => (
              <View key={index} style={styles.childCard}>
                <MaterialCommunityIcons
                  name="emoticon-happy-outline"
                  size={24}
                  color="#7D7D7D"
                />

                <View style={{ marginLeft: 14 }}>
                  <Text style={styles.childLabel}>Ime i prezime</Text>
                  <Text style={styles.childName}>{child.name}</Text>
                </View>
              </View>
            ))}

            {/* ADD MORE */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("AddChild")}
            >
              <Text style={styles.addMoreText}>Dodaj dijete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  headerWrapper: {
    marginTop: Platform.OS === "android" ? 20 : 80,
  },

  content: {
    marginTop: 30,
    paddingHorizontal: 20,
  },

  childCard: {
    backgroundColor: "#C0EAF0",
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  childLabel: {
    fontSize: 12,
    color: "#7D7D7D",
    fontFamily: "SFCompactRounded-Regular",
  },

  childName: {
    fontSize: 16,
    color: "#4A4A4A",
    fontFamily: "SFCompactRounded-Semibold",
  },

  addMoreText: {
    marginTop: 8,
    textAlign: "right",
    fontSize: 14,
    color: "#228390",
    fontFamily: "SFCompactRounded-Semibold",
  },

  addEmpty: {
    alignItems: "center",
    marginTop: 40,
  },

  addEmptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#7D7D7D",
    fontFamily: "SFCompactRounded-Semibold",
  },
});

export default ChildrenListScreen;

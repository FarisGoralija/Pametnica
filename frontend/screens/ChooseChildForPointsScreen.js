import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import HeaderWithBack from "../components/HeaderWithBack";
import RoleCard from "../components/RoleCard";
import NextButton from "../components/NextButton";

const ChooseChildForPointsScreen = () => {
  const navigation = useNavigation();

  // 🔹 TEMP (later from context / backend)
  const children = [
    { id: 1, name: "Faris" },
    { id: 2, name: "Erol" },
  ];

  const [selectedChildId, setSelectedChildId] = useState(null);

  const handleNext = () => {
    if (!selectedChildId) return;

    navigation.navigate("RemovePointsAmount", {
      childId: selectedChildId,
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack
          title="Skini bodove"
          subtitle="Odaberi dijete kojem želiš skinuti bodove"
        />
      </View>

      <View style={styles.content}>
        {children.length === 0 ? (
          <>
            <Text style={styles.emptyText}>
              Trenutno nemate registrovano dijete
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("AddChild")}
            >
              <Text style={styles.addChildText}>Dodaj dijete</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.cardsRow}>
              {children.map((child) => (
                <RoleCard
                  key={child.id}
                  title={child.name}
                  iconName="emoticon-happy-outline"
                  isSelected={selectedChildId === child.id}
                  onPress={() => setSelectedChildId(child.id)}
                />
              ))}
            </View>

            <NextButton
              title="Dalje"
              onPress={handleNext}
              isDisabled={!selectedChildId}
            />
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
    alignItems: "center",
    paddingHorizontal: 40,
  },

  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 40,
  },

  emptyText: {
    fontSize: 14,
    fontFamily: "SFCompactRounded-Regular",
    color: "#7D7D7D",
    textAlign: "center",
    marginTop: 40,
  },

  addChildText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: "SFCompactRounded-Semibold",
    color: "#228390",
  },
});

export default ChooseChildForPointsScreen;

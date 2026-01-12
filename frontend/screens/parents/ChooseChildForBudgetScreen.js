import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import HeaderWithBack from "../../components/HeaderWithBack";
import RoleCard from "../../components/RoleCard";
import NextButton from "../../components/NextButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useChildren } from "../../context/ChildrenContext";

const ChooseChildForBudgetScreen = () => {
  const navigation = useNavigation();
  const { childrenList, refreshChildren, loadingChildren, childrenError } =
    useChildren();

  const [selectedChildId, setSelectedChildId] = useState(null);
  const handleNext = () => {
    if (selectedChildId === null) return;

    navigation.navigate("SetBudgetAmount", {
      childId: selectedChildId,
      childName:
        childrenList.find((c) => c.id === selectedChildId)?.name || "",
    });
  };

  const isSingleChild = childrenList.length === 1;

  useFocusEffect(
    useCallback(() => {
      refreshChildren();
    }, [refreshChildren])
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack
          title="Postavi mjesečni budžet"
          subtitle="Odaberite dijete za koje želite postaviti mjesečni budžet"
        />
      </View>

      <View style={styles.content}>
        {childrenError ? (
          <Text style={styles.errorText}>{childrenError}</Text>
        ) : null}
        {loadingChildren && childrenList.length === 0 ? (
          <Text style={styles.loadingText}>Učitavanje...</Text>
        ) : childrenList.length === 0 ? (
          <>
            <Text style={styles.emptyText}>
              Nemate dodanu djecu. Da biste postavili mjesečni budžet, prvo
              dodajte dijete.
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
            <View
              style={[
                styles.cardsRow,
                isSingleChild && styles.centerSingleCard,
              ]}
            >
              {childrenList.map((child) => (
                <RoleCard
                  key={child.id}
                  title={(child.name || "").split(" ")[0] || "Dijete"}
                  icon={
                    <MaterialCommunityIcons
                      name="emoticon-happy-outline"
                      size={48}
                      color="#7D7D7D"
                    />
                  }
                  isSelected={selectedChildId === child.id}
                  onPress={() => setSelectedChildId(child.id)}
                />
              ))}
            </View>

            <NextButton
              title="Dalje"
              onPress={handleNext}
              isDisabled={selectedChildId === null}
            />
          </>
        )}
      </View>
    </View>
  );
};

export default ChooseChildForBudgetScreen;

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

  centerSingleCard: {
    justifyContent: "center",
  },

  emptyText: {
    fontSize: 14,
    fontFamily: "SFCompactRounded-Regular",
    color: "#7D7D7D",
    textAlign: "center",
    marginTop: 40,
    lineHeight: 20,
  },

  addChildText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: "SFCompactRounded-Semibold",
    color: "#228390",
  },

  loadingText: {
    fontSize: 14,
    fontFamily: "SFCompactRounded-Regular",
    color: "#7D7D7D",
    textAlign: "center",
    marginTop: 16,
  },

  errorText: {
    fontSize: 14,
    fontFamily: "SFCompactRounded-Regular",
    color: "#E53935",
    textAlign: "center",
    marginTop: 16,
  },
});

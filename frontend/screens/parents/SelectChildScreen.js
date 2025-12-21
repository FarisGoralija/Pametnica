import React, { useState } from "react";
import { View, StyleSheet, FlatList, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";

import HeaderWithBack from "../../components/HeaderWithBack";
import RoleCard from "../../components/RoleCard";
import NextButton from "../../components/NextButton";
import { useChildren } from "../../context/ChildrenContext";

const SelectChildScreen = () => {
  const navigation = useNavigation();
  const { childrenList } = useChildren();

  const [selectedChildId, setSelectedChildId] = useState(null);

  const handleNext = () => {
    if (!selectedChildId) return;

    navigation.navigate("ParentListsMain", {
      childId: selectedChildId,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithBack
        title="Odaberi dijete"
        subtitle="Izaberite dijete za koje želite pregledati liste"
      />

      {/* LIST */}
      <View style={styles.listWrapper}>
        <FlatList
          data={childrenList}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.column}
          renderItem={({ item }) => (
            <RoleCard
              title={item.name}
              iconName="emoticon-happy-outline"
              isSelected={item.id === selectedChildId}
              onPress={() => setSelectedChildId(item.id)}
            />
          )}
        />
      </View>

      {/* ✅ BUTTON — NOW CENTERED & VISIBLE */}
      <View style={styles.buttonWrapper}>
        <NextButton
          title="Nastavi"
          onPress={handleNext}
          isDisabled={!selectedChildId}
        />
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  listWrapper: {
    flex: 1, // 👈 allows FlatList to scroll
    paddingHorizontal: 24,
    marginTop: 24,
  },

  listContent: {
    alignItems: "center", // 👈 center RoleCards
    paddingBottom: 20,
  },

  column: {
    justifyContent: "space-between",
    gap: 20,
  },

  buttonWrapper: {
    alignItems: "center", // 👈 REQUIRED for fixed-width button
    paddingVertical: 16,
    paddingBottom: 150,
  },
});

export default SelectChildScreen;

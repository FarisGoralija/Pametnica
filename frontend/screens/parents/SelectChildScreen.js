import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import HeaderComponent from "../../components/HeaderNoBack";
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
      {/* HEADER (NO BACK BUTTON) */}
      <HeaderComponent
        title="Odaberi juniora"
        subtitle="Izaberite juniora za koje želite pregledati liste"
      />

      {childrenList.length === 0 ? (
        /* EMPTY STATE */
        <View style={styles.emptyWrapper}>
          <Text style={styles.emptyText}>
            Nemate dodanu djecu. Da biste nastavili, prvo dodajte junior korisnika.
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate("Profil", {
                screen: "AddChild",
              })
            }
          >
            <Text style={styles.addChildText}>Dodaj junior korisnika</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
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

          {/* BUTTON */}
          <View style={styles.buttonWrapper}>
            <NextButton
              title="Nastavi"
              onPress={handleNext}
              isDisabled={!selectedChildId}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default SelectChildScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  listWrapper: {
    flex: 1,
    paddingHorizontal: 24,
  },

  listContent: {
    alignItems: "center",
    paddingBottom: 20,
  },

  column: {
    justifyContent: "space-between",
    gap: 20,
  },

  buttonWrapper: {
    alignItems: "center",
    paddingVertical: 16,
    paddingBottom: 150,
  },

  /* EMPTY STATE */
  emptyWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  emptyText: {
    fontSize: 14,
    fontFamily: "SFCompactRounded-Regular",
    color: "#7D7D7D",
    textAlign: "center",
    lineHeight: 20,
  },

  addChildText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: "SFCompactRounded-Semibold",
    color: "#228390",
  },
});

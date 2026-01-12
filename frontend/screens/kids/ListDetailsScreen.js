import React from "react";
import { View, StyleSheet, Text, ScrollView, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import HeaderWithBack from "../../components/HeaderWithBack";

const ListDetailsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { list } = route.params;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack
          title="Detalji liste"
          onBack={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: "ListsMain" }],
            })
          }
        />
      </View>

      {/* CARD */}
      <View style={styles.card}>
        {/* TITLE */}
        <Text style={styles.listTitle}>{list.title}</Text>

        {/* ITEMS */}
        <ScrollView
          contentContainerStyle={styles.itemsWrapper}
          showsVerticalScrollIndicator={false}
        >
          {list.items.length === 0 ? (
            <Text style={styles.emptyText}>Ova lista nema stavki</Text>
          ) : (
            list.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={26}
                  color="#12C7E5"
                />

                <Text style={styles.itemText}>{item.text || item.name}</Text>
              </View>
            ))
          )}
        </ScrollView>
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

  card: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: "#6FD6D4",
    borderRadius: 26,
    padding: 18,
    elevation: 4,
  },

  listTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#4A4A4A",
    marginBottom: 14,
  },

  itemsWrapper: {
    backgroundColor: "#FFFDF8",
    borderRadius: 18,
    padding: 16,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#12C7E5",
  },

  itemText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
    color: "#4A4A4A",
  },

  emptyText: {
    fontSize: 14,
    color: "#8A8A8A",
    textAlign: "center",
    paddingVertical: 20,
  },
});

export default ListDetailsScreen;

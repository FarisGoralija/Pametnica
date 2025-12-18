import React from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import ProfileCard from "../../components/ProfileCard";
import ActionSquare from "../../components/ActionSquare";
import ListsCard from "../../components/ListsCard";

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      {/* TOP CURVE */}
      <View style={styles.topBackground} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView edges={["top"]}>
          <Text style={styles.title}>Početna</Text>
        </SafeAreaView>

        {/* PROFILE */}
        <ProfileCard
          name="Faris Goralija"
          points="50 poena"
          balanceLabel="Dostupni novac"
          balanceValue="200 KM"
          backgroundColor="#12C7E5"
          avatarIcon={
            <MaterialCommunityIcons name="account" size={28} color="#fff" />
          }
          rightIcon={
            <MaterialCommunityIcons name="bitcoin" size={40} color="#FFD54F" />
          }
        />

        {/* ACTIONS */}
        <View style={styles.row}>
          <ActionSquare
            title="Dodaj listu"
            backgroundColor="#12C7E5"
            icon={<MaterialCommunityIcons name="plus" size={32} color="#fff" />}
            onPress={() => {}}
          />

          <View style={{ width: 12 }} />

          <ActionSquare
            title="Pregled listi"
            backgroundColor="#6AD2A5"
            icon={
              <MaterialCommunityIcons
                name="clipboard-text"
                size={32}
                color="#fff"
              />
            }
            onPress={() => {}}
          />
        </View>

        {/* LISTS */}
        <ListsCard
          title="Moje liste"
          emptyText="Tvoje liste su prazne"
          buttonText="Kreiraj novu listu"
          backgroundColor="#77D9D9"
          icon={
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={40}
              color="#fff"
            />
          }
          onCreatePress={() => {}}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF9FB",
  },

  topBackground: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 300, // ⬅️ slightly taller
    backgroundColor: "#BDEFF4",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 80, // ⬅️ THIS pushes everything down
    paddingBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#8EDDDD",
    textAlign: "center",
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
});

export default HomeScreen;

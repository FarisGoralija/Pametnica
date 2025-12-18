import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import ProfileCard from "../../components/ProfileCard";
import ActionSquare from "../../components/ActionSquare";
import ListsCard from "../../components/ListsCard";
import AddListModal from "../../components/AddListModal";

const HomeScreen = () => {
  const [showAddList, setShowAddList] = useState(false);

  return (
    <View style={styles.container}>
      {/* BOTTOM CURVED BACKGROUND */}
      <View style={styles.bottomWave} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* TITLE */}
        <SafeAreaView edges={["top"]}>
          <Text style={styles.title}>Početna</Text>
        </SafeAreaView>

        {/* PROFILE CARD */}
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
            <MaterialCommunityIcons name="bitcoin" size={60} color="#FFD54F" />
          }
        />

        {/* ACTION BUTTONS */}
        <View style={styles.row}>
          <ActionSquare
            title="Dodaj listu"
            backgroundColor="#12C7E5"
            icon={<MaterialCommunityIcons name="plus" size={50} color="#fff" />}
            onPress={() => setShowAddList(true)}
          />

          <View style={{ width: 12 }} />

          <ActionSquare
            title="Pregled listi"
            backgroundColor="#6AD2A5"
            icon={
              <MaterialCommunityIcons
                name="clipboard-text"
                size={45}
                color="#fff"
              />
            }
            onPress={() => {}}
          />
        </View>

        {/* LISTS CARD */}
        <ListsCard
          title="Moje liste"
          emptyText="Tvoje liste su prazne"
          buttonText="Kreiraj novu listu"
          backgroundColor="#77D9D9"
          icon={
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={60}
              color="#fff"
            />
          }
          onCreatePress={() => setShowAddList(true)}
        />
      </ScrollView>

      {/* ADD LIST MODAL */}
      <AddListModal
        visible={showAddList}
        onClose={() => setShowAddList(false)}
        onNewList={() => {
          setShowAddList(false);
          // navigation.navigate("CreateList");
        }}
        onUrgentList={() => {
          setShowAddList(false);
          // navigation.navigate("UrgentList");
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  bottomWave: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "55%",
    backgroundColor: "#BDEFF4",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 40,
  },

  title: {
    fontSize: 40,
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

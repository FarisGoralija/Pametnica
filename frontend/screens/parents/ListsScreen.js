import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Text,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import HeaderWithBack from "../../components/HeaderWithBack";
import ListsCard from "../../components/ListsCard";
import { useList } from "../../context/ListContext";

const ParentListsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { lists, loadParentLists } = useList();
  const childId = route.params?.childId;
  const [activeTab, setActiveTab] = useState("approved");

  const waitingLists = lists.filter((l) => l.parentApproved === false);

  const approvedLists = lists.filter((l) => l.parentApproved === true);

  useFocusEffect(
    useCallback(() => {
      if (childId) {
        loadParentLists(childId).catch(() => {});
      }
    }, [childId, loadParentLists])
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack title="Pregled dječije liste" subtitle="" />
      </View>

      {/* BACKGROUND CURVE */}
      <View style={styles.bottomWave} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* TABS */}
        <View style={styles.tabs}>
          <TabButton
            text="Čekanje"
            icon="clock-outline"
            active={activeTab === "waiting"}
            onPress={() => setActiveTab("waiting")}
          />

          <TabButton
            text="Odobrene"
            icon="check-circle-outline"
            active={activeTab === "approved"}
            onPress={() => setActiveTab("approved")}
          />
        </View>

        {activeTab === "waiting" && (
          <ListsCard
            title="Liste na čekanju"
            emptyText="Nema lista na čekanju"
            backgroundColor="#77D9D9"
            icon={
              <MaterialCommunityIcons
                name="clock-outline"
                size={60}
                color="#fff"
              />
            }
            lists={waitingLists}
            onCardPress={(list) =>
              navigation.navigate("ParentListDetails", { listId: list.id })
            }
          />
        )}

        {activeTab === "approved" && (
          <ListsCard
            title="Odobrene liste"
            emptyText="Nema odobrenih lista"
            backgroundColor="#77D9D9"
            icon={
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={60}
                color="#fff"
              />
            }
            lists={approvedLists}
            onCardPress={(list) =>
              navigation.navigate("ParentListDetails", { listId: list.id })
            }
          />
        )}
      </ScrollView>
    </View>
  );
};

/* TAB BUTTON */
const TabButton = ({ text, icon, active, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.activeTab]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={active ? "#FFFFFF" : "#7A7A7A"}
        style={{ marginRight: 8 }}
      />
      <Text style={[styles.tabText, active && styles.activeTabText]}>
        {text}
      </Text>
    </TouchableOpacity>
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

  bottomWave: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "55%",
    backgroundColor: "#D6F3F6",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 28,
    marginTop: 10,
  },

  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 18,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 12,
    elevation: 2,
  },

  activeTab: {
    backgroundColor: "#12C7E5",
  },

  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7A7A7A",
  },

  activeTabText: {
    color: "#FFFFFF",
  },
});

export default ParentListsScreen;

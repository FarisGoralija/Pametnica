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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useList } from "../../context/ListContext";
import HeaderWithBack from "../../components/HeaderWithBack";
import ListsCard from "../../components/ListsCard";
import AddListModal from "../../components/AddListModal";

const ListsScreen = () => {
  const { lists, loadChildLists } = useList();
  const activeLists = lists.filter((l) => l.status === "active");
  const waitingLists = lists.filter((l) => l.status === "waiting");

  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState("active");
  const [showAddList, setShowAddList] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadChildLists().catch(() => {});
    }, [loadChildLists])
  );

  const handleNewList = () => {
    setShowAddList(false);

    // Smooth modal close + navigation (iOS & Android safe)
    requestAnimationFrame(() => {
      navigation.navigate("NewListScreen"); // 🔁 make sure this route exists
    });
  };

  const handleUrgentList = () => {
    setShowAddList(false);

    requestAnimationFrame(() => {
      navigation.navigate("UrgentListScreen"); // 🔁 make sure this route exists
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack
          title="Liste"
          subtitle=""
          onBack={() => navigation.navigate("Početna")}
        />
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
            text="Aktivne"
            icon="check-circle-outline"
            active={activeTab === "active"}
            onPress={() => setActiveTab("active")}
          />

          <TabButton
            text="Čekanje"
            icon="clock-outline"
            active={activeTab === "waiting"}
            onPress={() => setActiveTab("waiting")}
          />
        </View>

        {activeTab === "active" && (
          <ListsCard
            title="Aktivne liste"
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
            lists={activeLists}
            onCardPress={(list) =>
              navigation.replace("ListDetailsScreen", { list })
            }
            onCreatePress={() => setShowAddList(true)}
          />
        )}

        {activeTab === "waiting" && (
          <ListsCard
            title="Liste na čekanju"
            emptyText="Nema lista na čekanju"
            buttonText="Kreiraj novu listu"
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
              navigation.replace("ListDetailsScreen", { list })
            }
            onCreatePress={() => setShowAddList(true)}
          />
        )}
      </ScrollView>

      {/* ADD LIST MODAL */}
      <AddListModal
        visible={showAddList}
        onClose={() => setShowAddList(false)}
        onNewList={handleNewList}
        onUrgentList={handleUrgentList}
      />
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

export default ListsScreen;

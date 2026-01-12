import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Text,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import HeaderWithBack from "../../components/HeaderWithBack";
import ListsCard from "../../components/ListsCard";
import { useAuth } from "../../context/AuthContext";
import { useChildren } from "../../context/ChildrenContext";
import {
  getParentActiveLists,
  getParentPendingLists,
} from "../../api/endpoints";

const ParentListsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { token } = useAuth();
  const { childrenList } = useChildren();
  const childId = route?.params?.childId || childrenList?.[0]?.id;
  const [activeTab, setActiveTab] = useState("approved");
  const [activeLists, setActiveLists] = useState([]);
  const [pendingLists, setPendingLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const normalizeList = (list) => {
    if (!list) return null;
    return {
      id: list.id || list.Id,
      title: list.title || list.Title || "Lista",
      status: list.status || list.Status,
      type: list.type || list.Type,
      items: list.items || list.Items || [],
    };
  };

  const fetchLists = useCallback(async () => {
    if (!token || !childId) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const [activeRes, pendingRes] = await Promise.all([
        getParentActiveLists(token, childId),
        getParentPendingLists(token, childId),
      ]);
      setActiveLists(
        Array.isArray(activeRes)
          ? activeRes.map((l) => normalizeList(l)).filter(Boolean)
          : []
      );
      setPendingLists(
        Array.isArray(pendingRes)
          ? pendingRes.map((l) => normalizeList(l)).filter(Boolean)
          : []
      );
    } catch (err) {
      setErrorMessage(
        err?.message || "Neuspješno učitavanje listi. Pokušajte ponovo."
      );
    } finally {
      setLoading(false);
    }
  }, [token, childId]);

  useFocusEffect(
    useCallback(() => {
      fetchLists();
    }, [fetchLists])
  );

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchLists();
    setRefreshing(false);
  };

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
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

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
        {loading && activeLists.length === 0 && pendingLists.length === 0 ? (
          <Text style={styles.loadingText}>Učitavanje...</Text>
        ) : activeTab === "waiting" ? (
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
            lists={pendingLists}
            onCardPress={(list) =>
              navigation.navigate("ParentListDetails", {
                listId: list.id,
                childId,
              })
            }
          />
        ) : (
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
            lists={activeLists}
            onCardPress={(list) =>
              navigation.navigate("ParentListDetails", {
                listId: list.id,
                childId,
              })
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

  loadingText: {
    textAlign: "center",
    color: "#7D7D7D",
    fontSize: 14,
    marginBottom: 12,
  },

  errorText: {
    textAlign: "center",
    color: "#E53935",
    fontSize: 14,
    marginBottom: 12,
  },
});

export default ParentListsScreen;
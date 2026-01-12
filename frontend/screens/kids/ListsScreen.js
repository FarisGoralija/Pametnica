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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import {
  getChildActiveLists,
  getChildPendingLists,
} from "../../api/endpoints";
import HeaderWithBack from "../../components/HeaderWithBack";
import ListsCard from "../../components/ListsCard";
import AddListModal from "../../components/AddListModal";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { deleteShoppingList } from "../../api/endpoints";

const ListsScreen = () => {
  const navigation = useNavigation();
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState("active");
  const [showAddList, setShowAddList] = useState(false);
  const [activeLists, setActiveLists] = useState([]);
  const [pendingLists, setPendingLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);

  const normalizeList = (list) => {
    if (!list) return null;
    const items =
      list.items ||
      list.Items ||
      [];
    return {
      id: list.id || list.Id,
      title: list.title || list.Title || "Lista",
      status: list.status || list.Status,
      type: list.type || list.Type,
      items: Array.isArray(items)
        ? items.map((it) => ({
            id: it.id || it.Id,
            text:
              it.text ||
              it.Text ||
              it.name ||
              it.Name ||
              "",
          }))
        : [],
    };
  };

  const fetchLists = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const [activeRes, pendingRes] = await Promise.all([
        getChildActiveLists(token),
        getChildPendingLists(token),
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
  }, [token]);

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

  const confirmDelete = (listId) => {
    setListToDelete(listId);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!listToDelete || !token) {
      setDeleteModalVisible(false);
      return;
    }
    try {
      await deleteShoppingList(listToDelete, token);
      setActiveLists((prev) => prev.filter((l) => l.id !== listToDelete));
      setPendingLists((prev) => prev.filter((l) => l.id !== listToDelete));
    } catch (err) {
      setErrorMessage(err?.message || "Brisanje liste nije uspjelo.");
    } finally {
      setDeleteModalVisible(false);
      setListToDelete(null);
    }
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
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

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
        {loading && activeLists.length === 0 && pendingLists.length === 0 ? (
          <Text style={styles.loadingText}>Učitavanje...</Text>
        ) : activeTab === "active" ? (
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
            renderExtraAction={(list) => (
              <TouchableOpacity
                onPress={() => confirmDelete(list.id)}
                style={{ paddingHorizontal: 8, paddingVertical: 4 }}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={22}
                  color="#E53935"
                />
              </TouchableOpacity>
            )}
            onCreatePress={() => setShowAddList(true)}
          />
        ) : (
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
            lists={pendingLists}
            onCardPress={(list) =>
              navigation.replace("ListDetailsScreen", { list })
            }
            renderExtraAction={(list) => (
              <TouchableOpacity
                onPress={() => confirmDelete(list.id)}
                style={{ paddingHorizontal: 8, paddingVertical: 4 }}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={22}
                  color="#E53935"
                />
              </TouchableOpacity>
            )}
            onCreatePress={() => setShowAddList(true)}
          />
        )}
      </ScrollView>

      {/* ADD LIST MODAL */}
      <AddListModal
        visible={showAddList}
        onClose={() => setShowAddList(false)}
      />

      <ConfirmDeleteModal
        visible={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDelete}
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

export default ListsScreen;
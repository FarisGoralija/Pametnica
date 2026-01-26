import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  RefreshControl,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ProfileCard from "../../components/ProfileCard";
import ActionSquare from "../../components/ActionSquare";
import ListsCard from "../../components/ListsCard";
import AddListModal from "../../components/AddListModal";
import { useAuth } from "../../context/AuthContext";
import { getChildActiveLists, getMe } from "../../api/endpoints";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [showAddList, setShowAddList] = useState(false);
  const [myLists, setMyLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [points, setPoints] = useState(0);
  const [balance, setBalance] = useState(0);
  const [allowance, setAllowance] = useState(0);

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

  const fetchMe = useCallback(async () => {
    if (!token) return;
    try {
      const me = await getMe(token);
      setFullName(me.fullName || "");
      setPoints(me.points ?? 0);
      setBalance(me.currentBalance ?? 0);
      setAllowance(me.monthlyAllowance ?? 0);
    } catch (err) {
      setErrorMessage(err?.message || "Neuspješno učitavanje profila.");
    }
  }, [token]);

  const fetchActive = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const activeRes = await getChildActiveLists(token);
      setMyLists(
        Array.isArray(activeRes)
          ? activeRes.map((l) => normalizeList(l)).filter(Boolean)
          : []
      );
    } catch (err) {
      setErrorMessage(
        err?.message || "Neuspješno učitavanje aktivnih listi."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchMe();
      fetchActive();
    }, [fetchActive, fetchMe])
  );

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchActive();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* BOTTOM CURVED BACKGROUND */}
      <View style={styles.bottomWave} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* TITLE */}
        <SafeAreaView edges={["top"]}>
          <Text style={styles.title}>Početna</Text>
        </SafeAreaView>

        {/* PROFILE CARD */}
        <ProfileCard
          name={fullName || "Tvoj profil"}
          points={`${points} poena`}
          balanceLabel="Dostupni novac"
          balanceValue={balance}
          maxBalance={allowance || 200}
          backgroundColor="#3793F0"
          avatarIcon={
            <MaterialCommunityIcons name="account" size={28} color="#fff" />
          }
          rightIcon={
            <MaterialCommunityIcons name="cash-multiple" size={60} color="#FFD54F" />
          }
        />

        {/* ACTION BUTTONS */}
        <View style={styles.row}>
          <ActionSquare
            title="Dodaj listu"
            backgroundColor="#3793F0"
            icon={<MaterialCommunityIcons name="plus" size={50} color="#fff" />}
            onPress={() => setShowAddList(true)}
          />

          <View style={{ width: 12 }} />

          <ActionSquare
            title="Pregled listi"
            backgroundColor="#0af5aa"
            icon={
              <MaterialCommunityIcons
                name="clipboard-text"
                size={45}
                color="#fff"
              />
            }
            onPress={() =>
              navigation.navigate("Liste", {
                screen: "ListsMain",
              })
            }
          />
        </View>

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
          lists={myLists}
          onCardPress={(list) =>
            navigation.navigate("Liste", {
              screen: "ListDetailsScreen",
              params: { list },
            })
          }
          onCreatePress={() => setShowAddList(true)}
        />
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
        {loading && myLists.length === 0 ? (
          <Text style={styles.loadingText}>Učitavanje...</Text>
        ) : null}
      </ScrollView>

      <AddListModal
        visible={showAddList}
        onClose={() => setShowAddList(false)}
        onNewList={() => {
          setShowAddList(false);
          setTimeout(() => {
            navigation.navigate("Liste", {
              screen: "NewListScreen",
            });
          }, 180);
        }}
        onUrgentList={() => {
          setShowAddList(false);
          setTimeout(() => {
            navigation.navigate("Liste", {
              screen: "UrgentListScreen",
            });
          }, 180);
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
    height: "50%",
    backgroundColor: "#BDEFF4",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: Platform.OS === "android" ? 40 : 50,
  },

  title: {
    fontSize: 40,
    fontWeight: "700",
    color: "#2787CC",
    textAlign: "center",
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    marginBottom: 16,
  },

  loadingText: {
    textAlign: "center",
    color: "#7D7D7D",
    fontSize: 14,
    marginTop: 8,
  },

  errorText: {
    textAlign: "center",
    color: "#E53935",
    fontSize: 14,
    marginTop: 8,
  },
});

export default HomeScreen;
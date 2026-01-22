import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

import HeaderWithBack from "../../components/HeaderWithBack";
import ProfileOptionRow from "../../components/ProfileOptionRow";
import { useNavigation } from "@react-navigation/native";

const ProfileParentScreen = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack title="Profil" subtitle="" />
      </View>

      {/* OPTIONS */}
      <View style={styles.content}>
        <ProfileOptionRow
          icon={
            <MaterialCommunityIcons
              name="account-outline"
              size={24}
              color="#FAFAFA"
            />
          }
          text="Detalji profila"
          onPress={() => navigation.navigate("ProfileDetailsParent")}
        />

        <ProfileOptionRow
          icon={
            <MaterialCommunityIcons
              name="account-child-outline"
              size={24}
              color="#FAFAFA"
            />
          }
          text="Juniori korisnici"
          onPress={() => navigation.navigate("ChildrenList")}
        />

        <ProfileOptionRow
          icon={
            <MaterialCommunityIcons name="cash" size={24} color="#FAFAFA" />
          }
          text="Postavi mjesečni budžet"
          onPress={() => navigation.navigate("ChooseChildForBudget")}
        />

        <ProfileOptionRow
          icon={
            <MaterialCommunityIcons
              name="currency-usd-off"
              size={24}
              color="#FAFAFA"
            />
          }
          text="Skini bodove"
          onPress={() => navigation.navigate("ChooseChildForPoints")}
        />

        {/* LOGOUT */}
        <ProfileOptionRow
          icon={
            <MaterialCommunityIcons name="logout" size={24} color="#E53935" />
          }
          text="Odjavi se"
          textColor="#E53935"
          onPress={logout}
        />
      </View>
    </View>
  );
};

export default ProfileParentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  headerWrapper: {
    marginTop: Platform.OS === "android" ? 20 : 80,
  },

  content: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
});

import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../../context/AuthContext";
import HeaderWithBack from "../../components/HeaderWithBack";
import ProfileOptionRow from "../../components/ProfileOptionRow";

const ProfileChildScreen = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <HeaderWithBack title="Profil" subtitle="" />
      </View>

      <View style={styles.content}>
        <ProfileOptionRow
          icon={
            <MaterialCommunityIcons
              name="account-outline"
              size={24}
              color="#7D7D7D"
            />
          }
          text="Detalji profila"
          onPress={() => navigation.navigate("ProfileDetailsChild")}
        />

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

export default ProfileChildScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  headerWrapper: { marginTop: Platform.OS === "android" ? 20 : 80 },
  content: { marginTop: 30, paddingHorizontal: 20 },
});

import React from "react";
import {
  View,
  StyleSheet,
  Platform,
  Text,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import HeaderWithBack from "../../components/HeaderWithBack";
import ProfileDetailRow from "../../components/ProfileDetailRow";

const ProfileDetailsChildScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <HeaderWithBack title="Detalji profila" subtitle="" />
      </View>

      <View style={styles.content}>
        <ProfileDetailRow
          label="Ime"
          value="Faris"
          leftIcon={
            <MaterialCommunityIcons
              name="account-outline"
              size={24}
              color="#7D7D7D"
            />
          }
          rightIcon={
            <MaterialCommunityIcons name="pencil" size={20} color="#7D7D7D" />
          }
          onPress={() => {}}
        />

        <ProfileDetailRow
          label="Prezime"
          value="Goralija"
          leftIcon={
            <MaterialCommunityIcons
              name="account-outline"
              size={24}
              color="#7D7D7D"
            />
          }
          rightIcon={
            <MaterialCommunityIcons name="pencil" size={20} color="#7D7D7D" />
          }
          onPress={() => {}}
        />

        <ProfileDetailRow
          label="Email adresa"
          value="faris.goralija@gmail.com"
          leftIcon={
            <MaterialCommunityIcons
              name="email-outline"
              size={24}
              color="#7D7D7D"
            />
          }
          rightIcon={
            <MaterialCommunityIcons name="pencil" size={20} color="#7D7D7D" />
          }
          onPress={() => {}}
        />

        <ProfileDetailRow
          label="Šifra"
          value="***************"
          leftIcon={
            <MaterialCommunityIcons
              name="lock-outline"
              size={24}
              color="#7D7D7D"
            />
          }
          rightIcon={
            <MaterialCommunityIcons
              name="eye-off-outline"
              size={20}
              color="#7D7D7D"
            />
          }
          onPress={() => {}}
        />

       
      </View>
    </View>
  );
};

export default ProfileDetailsChildScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  headerWrapper: { marginTop: Platform.OS === "android" ? 20 : 80 },
  content: { marginTop: 30, paddingHorizontal: 20 },
  changePasswordText: {
    fontSize: 14,
    fontFamily: "SFCompactRounded-Semibold",
    color: "#228390",
    textAlign: "right",
    marginTop: 8,
  },
});

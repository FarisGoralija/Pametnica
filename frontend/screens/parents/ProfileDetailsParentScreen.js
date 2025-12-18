import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import HeaderWithBack from "../../components/HeaderWithBack";
import ProfileDetailRow from "../../components/ProfileDetailRow";

const ProfileDetailsParentScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack title="Detalji profila" subtitle="" />
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        {/* NAME */}
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

        {/* SURNAME */}
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

        {/* EMAIL */}
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

        {/* PASSWORD */}
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

        {/* CHANGE PASSWORD */}
        <TouchableOpacity activeOpacity={0.7} onPress={() => {}}>
          <Text style={styles.changePasswordText}>Promijeni šifru</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileDetailsParentScreen;

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

  changePasswordText: {
    fontSize: 14,
    fontFamily: "SFCompactRounded-Semibold",
    color: "#228390",
    textAlign: "right",
    marginTop: 8,
  },
});

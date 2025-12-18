import React, { useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";

import HeaderWithBack from "../../components/HeaderWithBack";
import CustomInput from "../../components/CustomInput";
import NextButton from "../../components/NextButton";

import { useChildren } from "../../context/ChildrenContext";

const AddChildScreen = () => {
  const navigation = useNavigation();
  const { addChild } = useChildren();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isDisabled = !name || !email || !password;

  const handleAddChild = () => {
    // ✅ add child to context
    addChild({
      name,
      email,
    });

    // ✅ go back to ChildrenList screen
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack
          title="Registracija djeteta"
          subtitle="Unesite osnovne podatke"
        />
      </View>

      {/* FORM */}
      <View style={styles.form}>
        <CustomInput
          placeholder="Ime i prezime"
          value={name}
          onChangeText={setName}
          iconName="account-outline"
        />

        <CustomInput
          placeholder="Email djeteta"
          value={email}
          onChangeText={setEmail}
          iconName="email-outline"
          keyboardType="email-address"
        />

        <CustomInput
          placeholder="Šifra"
          value={password}
          onChangeText={setPassword}
          iconName="lock-outline"
          secureTextEntry
          isPassword
        />

        <NextButton
          title="Dalje"
          onPress={handleAddChild}
          isDisabled={isDisabled}
        />
      </View>
    </View>
  );
};

export default AddChildScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  headerWrapper: {
    marginTop: Platform.OS === "android" ? 20 : 80,
  },

  form: {
    marginTop: 40,
    alignItems: "center",
  },
});

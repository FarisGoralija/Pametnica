import React, { useState } from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import HeaderWithBack from "../../components/HeaderWithBack";
import CustomInput from "../../components/CustomInput";
import NextButton from "../../components/NextButton";

const RegistrationScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  const isPasswordValid = passwordRegex.test(password);

  const handleCreateAccount = () => {
    setSubmitted(true);
    if (!firstName || !lastName || !isEmailValid || !isPasswordValid) return;
    console.log("Account created successfully");
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack
          title="Registracija"
          subtitle="Unesite svoje podatke za kreiranje naloga"
        />
      </View>

      {/* FORM */}
      <View style={styles.formWrapper}>
        <CustomInput
          placeholder="Ime"
          iconName="account-outline"
          value={firstName}
          onChangeText={(t) => {
            setFirstName(t);
            setSubmitted(false);
          }}
          error={submitted && !firstName}
        />

        <CustomInput
          placeholder="Prezime"
          iconName="account-outline"
          value={lastName}
          onChangeText={(t) => {
            setLastName(t);
            setSubmitted(false);
          }}
          error={submitted && !lastName}
        />

        <CustomInput
          placeholder="Email"
          iconName="email-outline"
          keyboardType="email-address"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            setSubmitted(false);
          }}
          error={submitted && !isEmailValid}
        />
        {submitted && !isEmailValid && (
          <Text style={styles.errorText}>Unesite ispravnu email adresu</Text>
        )}

        <CustomInput
          placeholder="Šifra"
          iconName="lock-outline"
          isPassword
          secureTextEntry
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            setSubmitted(false);
          }}
          error={submitted && !isPasswordValid}
        />
        {submitted && !isPasswordValid && (
          <Text style={styles.errorText}>
            Šifra mora imati najmanje 8 znakova, jedno veliko slovo, broj i
            simbol.
          </Text>
        )}
      </View>

      {/* BUTTON */}
      <View style={styles.buttonWrapper}>
        <NextButton title="Kreiraj nalog" onPress={handleCreateAccount} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // ✅ Android header lifted up, iOS unchanged
  headerWrapper: {
    marginTop: Platform.OS === "android" ? 20 : 80,
  },

  formWrapper: {
    alignItems: "center",
    marginTop: Platform.OS === "android" ? 10 : 20,
  },

  buttonWrapper: {
    alignItems: "center",
    marginTop: Platform.OS === "android" ? 40 : 0,
    marginBottom: Platform.OS === "android" ? 30 : 230,
  },

  errorText: {
    width: 300,
    color: "#E53935",
    fontSize: 13,
    marginTop: -6,
    marginBottom: 10,
    textAlign: "left",
    fontFamily: "SFCompactRounded-Regular",
  },
});

export default RegistrationScreen;
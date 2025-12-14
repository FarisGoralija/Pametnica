import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import HeaderWithBack from "../components/HeaderWithBack";
import CustomInput from "../components/CustomInput";
import NextButton from "../components/NextButton";

const RegistrationScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitted, setSubmitted] = useState(false);

  // ✅ VALIDATION
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  const isPasswordValid = passwordRegex.test(password);

  const isFormValid = firstName && lastName && isEmailValid && isPasswordValid;

  // 🔁 Reset errors when user types
  const handleFirstNameChange = (text) => {
    setFirstName(text);
    setSubmitted(false);
  };

  const handleLastNameChange = (text) => {
    setLastName(text);
    setSubmitted(false);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    setSubmitted(false);
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setSubmitted(false);
  };

  const handleCreateAccount = () => {
    setSubmitted(true);

    if (!isFormValid) {
      // ❌ show errors
      return;
    }

    // ✅ ALL GOOD
    console.log("Account created successfully");
  };

  return (
    <View style={styles.container}>
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
          onChangeText={handleFirstNameChange}
          error={submitted && !firstName}
        />

        <CustomInput
          placeholder="Prezime"
          iconName="account-outline"
          value={lastName}
          onChangeText={handleLastNameChange}
          error={submitted && !lastName}
        />

        {/* EMAIL */}
        <CustomInput
          placeholder="Email"
          iconName="email-outline"
          keyboardType="email-address"
          value={email}
          onChangeText={handleEmailChange}
          error={submitted && !isEmailValid}
        />
        {submitted && !isEmailValid && (
          <Text style={styles.errorText}>Unesite ispravnu email adresu</Text>
        )}

        {/* PASSWORD */}
        <CustomInput
          placeholder="Šifra"
          iconName="lock-outline"
          isPassword
          secureTextEntry
          value={password}
          onChangeText={handlePasswordChange}
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

  headerWrapper: {
    marginTop: 80,
  },

  formWrapper: {
    alignItems: "center",
    marginTop: 20,
  },

  buttonWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 230,
  },

  errorText: {
    width: 300, // 👈 same as input
    color: "#E53935",
    fontSize: 13,
    marginTop: -6,
    marginBottom: 10,
    textAlign: "left",
    fontFamily: "SFCompactRounded-Regular",
  },
});

export default RegistrationScreen;

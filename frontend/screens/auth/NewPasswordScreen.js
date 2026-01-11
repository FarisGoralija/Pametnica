import React, { useState } from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import HeaderWithBack from "../../components/HeaderWithBack";
import CustomInput from "../../components/CustomInput";
import NextButton from "../../components/NextButton";

const NewPasswordScreen = ({ navigation }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // ✅ PASSWORD RULES
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  const isPasswordValid = passwordRegex.test(password);
  const passwordsMatch = password === confirmPassword;

  const handlePasswordChange = (text) => {
    setPassword(text);
    setSubmitted(false);
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);

    if (!isPasswordValid || !passwordsMatch) return;

    // ✅ SUCCESS (later API call)
    console.log("Password reset successful");

    navigation.popToTop(); // or navigate to Login
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack
          title="Nova šifra"
          subtitle={"Unesite novu šifru za svoj profil."}
        />
      </View>

      {/* FORM */}
      <View style={styles.formWrapper}>
        <CustomInput
          placeholder="Nova šifra"
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

        <CustomInput
          placeholder="Potvrdi šifru"
          iconName="lock-outline"
          isPassword
          secureTextEntry
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          error={submitted && !passwordsMatch}
        />

        {submitted && !passwordsMatch && (
          <Text style={styles.errorText}>Šifre se ne podudaraju.</Text>
        )}
      </View>

      {/* BUTTON */}
      <View style={styles.buttonWrapper}>
        <NextButton title="Dalje" onPress={handleSubmit} />
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
    marginTop: Platform.OS === "android" ? 20 : 80,
  },

  formWrapper: {
    alignItems: "center",
    marginTop: 30,
  },

  buttonWrapper: {
    marginTop: 30,
    alignItems: "center",
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

export default NewPasswordScreen;

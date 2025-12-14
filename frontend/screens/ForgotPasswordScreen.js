import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import HeaderWithBack from "../components/HeaderWithBack";
import CustomInput from "../components/CustomInput";
import NextButton from "../components/NextButton";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // ✅ EMAIL VALIDATION
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

  const handleEmailChange = (text) => {
    setEmail(text);
    setSubmitted(false); // 👈 clear error when typing
  };

  const handleSubmit = () => {
    setSubmitted(true);

    if (!isEmailValid) {
      // ❌ show error
      return;
    }

    // ✅ ALL GOOD
    console.log("Reset password email sent");
  };

  return (
    <View style={styles.container}>
      {/* HEADER — SAME POSITION AS REGISTRATION */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack
          title="Zaboravljena šifra"
          subtitle={
            "Unesite svoju e-mail adresu\nza resetovanje šifre."
          }
        />
      </View>

      {/* FORM */}
      <View style={styles.formWrapper}>
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
    marginTop: 80, // 👈 SAME AS REGISTRATION
  },

  formWrapper: {
    alignItems: "center",
    marginTop: 40,
  },

  buttonWrapper: {
    marginTop: 30,
    alignItems: "center",
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

  footer: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    alignItems: "center",
  },
});

export default ForgotPasswordScreen;

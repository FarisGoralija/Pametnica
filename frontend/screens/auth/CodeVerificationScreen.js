import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Platform } from "react-native";
import HeaderWithBack from "../../components/HeaderWithBack";
import NextButton from "../../components/NextButton";

const CODE_LENGTH = 5;

const CodeVerificationScreen = ({ navigation }) => {
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (text) => {
    if (text.length <= CODE_LENGTH) {
      setCode(text.replace(/[^0-9]/g, ""));
      setSubmitted(false);
    }
  };

  const handleNext = () => {
    setSubmitted(true);

    if (code.length !== CODE_LENGTH) return;

    navigation.navigate("NewPasswordScreen");
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <HeaderWithBack
          title="Zaboravljena šifra"
          subtitle="Provjerite email i unesite 5-cifreni kod."
        />
      </View>

      {/* CODE INPUT */}
      <View style={styles.codeContainer}>
        {Array.from({ length: CODE_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.codeBox,
              submitted && code.length !== CODE_LENGTH && styles.errorBox,
            ]}
          >
            <Text style={styles.codeText}>{code[i] || ""}</Text>
          </View>
        ))}
      </View>

      {submitted && code.length !== CODE_LENGTH && (
        <Text style={styles.errorText}>
          Unesite svih 5 cifara. Pokušajte ponovo.
        </Text>
      )}

      {/* HIDDEN INPUT */}
      <TextInput
        value={code}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={CODE_LENGTH}
        style={styles.hiddenInput}
        autoFocus
      />

      <View style={styles.buttonWrapper}>
        <NextButton title="Dalje" onPress={handleNext} />
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

  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
  },

  codeBox: {
    width: 60,
    height: 65,
    backgroundColor: "#C0EAF0",
    borderRadius: 12,
    marginHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },

  errorBox: {
    borderWidth: 1.5,
    borderColor: "#E53935",
  },

  codeText: {
    fontSize: 35,
    fontFamily: "SFCompactRounded-Bold",
    color: "#7D7D7D",
  },

  hiddenInput: {
    position: "absolute",
    opacity: 0,
  },

  errorText: {
    textAlign: "center",
    color: "#E53935",
    marginTop: 12,
    fontSize: 13,
    fontFamily: "SFCompactRounded-Regular",
  },

  buttonWrapper: {
    marginTop: 30,
    alignItems: "center",
  },
});

export default CodeVerificationScreen;

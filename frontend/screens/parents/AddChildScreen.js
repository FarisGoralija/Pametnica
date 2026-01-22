import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import {
  useNavigation,
  useFocusEffect,
  CommonActions,
} from "@react-navigation/native";

import HeaderWithBack from "../../components/HeaderWithBack";
import CustomInput from "../../components/CustomInput";
import NextButton from "../../components/NextButton";
import { useChildren } from "../../context/ChildrenContext";
import { useAuth } from "../../context/AuthContext";
import { createChild } from "../../api/endpoints";

const AddChildScreen = () => {
  const navigation = useNavigation();
  const { addChild, childrenList } = useChildren();
  const { token, email: parentEmail } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [maxError, setMaxError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ REGEX VALIDATION
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  const isPasswordValid = passwordRegex.test(password);

  // ✅ Capitalize first letter + after space
  const handleNameChange = (text) => {
    const formatted = text
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

    setName(formatted);
    setSubmitted(false);
    setMaxError(false);
  };

  const handleAddChild = async () => {
    setSubmitted(true);
    setErrorMessage("");

    // ❌ MAX 2 CHILDREN
    if (childrenList.length >= 2) {
      setMaxError(true);
      return;
    }

    if (!name || !isEmailValid || !isPasswordValid) return;

    const [firstName, ...rest] = name.trim().split(/\s+/);
    const lastName = rest.join(" ");

    if (!firstName || !lastName) {
      setErrorMessage("Unesite ime i prezime djeteta.");
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const payload = {
        email,
        firstName,
        lastName,
        password,
        monthlyAllowance: 0,
      };
      const result = await createChild(payload, token, parentEmail);

      addChild(result?.id ? result : { id: Date.now().toString(), name, email });

      // ✅ RESET PROFILE STACK (FIXES LOOP)
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "ProfileParentMain" }],
        })
      );
    } catch (err) {
      setErrorMessage(err.message || "Registracija junior korisnika nije uspjela.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ HIDE TAB BAR WHILE ON THIS SCREEN
  useFocusEffect(
    React.useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: "none" },
      });

      return () => {
        navigation.getParent()?.setOptions({
          tabBarStyle: {
            position: "absolute",
            bottom: 30,
            marginHorizontal: "5%",
            height: 78,
            paddingBottom: 8,
            backgroundColor: "#92DAE8",
            borderRadius: 24,
            borderTopWidth: 0,
            elevation: 8,
          },
        });
      };
    }, [])
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.headerWrapper}>
              <HeaderWithBack
                title="Registracija junior korisnika"
                subtitle="Unesite osnovne podatke"
              />
            </View>

            {/* FORM */}
            <View style={styles.form}>
              <CustomInput
                placeholder="Ime i prezime"
                value={name}
                onChangeText={handleNameChange}
                iconName="account-outline"
                error={submitted && !name}
              />

              <CustomInput
                placeholder="Email junior korisnika"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setSubmitted(false);
                  setMaxError(false);
                }}
                iconName="email-outline"
                keyboardType="email-address"
                error={submitted && !isEmailValid}
              />
              {submitted && !isEmailValid && (
                <Text style={styles.errorText}>
                  Unesite ispravnu email adresu
                </Text>
              )}

              <CustomInput
                placeholder="Šifra"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setSubmitted(false);
                  setMaxError(false);
                }}
                iconName="lock-outline"
                secureTextEntry
                isPassword
                error={submitted && !isPasswordValid}
              />
              {submitted && !isPasswordValid && (
                <Text style={styles.errorText}>
                  Šifra mora imati najmanje 8 znakova, jedno veliko slovo, broj
                  i simbol.
                </Text>
              )}

              {maxError && (
                <Text style={styles.errorText}>
                  Možete dodati najviše dvoje djece.
                </Text>
              )}
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              <View style={styles.buttonSpacer}>
                <NextButton
                  title={loading ? "Dodavanje..." : "Dalje"}
                  onPress={handleAddChild}
                  isDisabled={loading}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    paddingBottom: 40,
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

  buttonSpacer: {
    marginTop: 16,
  },
});
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import CustomInput from "../../components/CustomInput";
import NextButton from "../../components/NextButton";
import Logo from "../../components/Logo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { loginParent, loginChild } from "../../api/endpoints";

const LoginScreen = ({ navigation, route }) => {
  const role = route?.params?.role || "parent";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ EMAIL REGEX
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

  const handleLogin = async () => {
    setErrorMessage("");

    if (!isEmailValid || password.length === 0) {
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      const loginFn = role === "child" ? loginChild : loginParent;
      const result = await loginFn({ email, password });
      const resolvedRole = result?.role || role;
      await login({
        role: resolvedRole,
        token: result?.token,
        email: result?.email,
      });
      console.log("Logged in successfully", result);
    } catch (err) {
      const rawMessage = err?.message || "";
      const lower = rawMessage.toLowerCase();

      let friendly = "Prijava nije uspjela. Pokušajte ponovo.";
      if (lower.includes("401") || lower.includes("invalid")) {
        friendly = "Unijeli ste netačne podatke za prijavu.";
      } else if (lower.includes("403") || lower.includes("not allowed")) {
        friendly = "Ovaj račun nema dozvolu za ovu prijavu.";
      }

      setErrorMessage(friendly);
    } finally {
      setLoading(false);
    }
  };
  const handleForgotPassword = () => {
    navigation.navigate("ForgotPasswordScreen");
  };

  const handleRegister = () => {
    navigation.navigate("RegistrationScreen", { role });
  };

  const isButtonDisabled = !isEmailValid || password.length === 0 || loading;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={50}
              color="#B0E5DD"
            />
          </TouchableOpacity>

          <Logo />

          {/* ROLE SUBTITLE */}
          <Text style={styles.roleSubtitle}>
            {role === "parent" ? "Račun za roditelje" : "Račun za djecu"}
          </Text>

          <View style={styles.contentContainer}>
            <CustomInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              iconName="email-outline"
              keyboardType="email-address"
            />

            <View style={styles.passwordWrapper}>
              <CustomInput
                key={showPassword ? "pw-show" : "pw-hide"}
                placeholder="Šifra"
                value={password}
                onChangeText={setPassword}
                iconName="lock-outline"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword((prev) => !prev)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#7D7D7D"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordButton}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Zaboravljena šifra?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonWrapper}>
            <NextButton
              title={loading ? "Prijava..." : "Prijavi se"}
              onPress={handleLogin}
              isDisabled={isButtonDisabled}
            />

            {/* REGISTER ONLY FOR PARENT */}
            {role === "parent" && (
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Nemaš račun? </Text>
                <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
                  <Text style={styles.registerLink}>Registruj se odmah!</Text>
                </TouchableOpacity>
              </View>
            )}
            {errorMessage ? (
              <Text style={styles.statusErrorText}>{errorMessage}</Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    padding: 20,
    paddingTop: Platform.OS === "android" ? 120 : 180,
  },

  roleSubtitle: {
    fontSize: 18,
    fontFamily: "SFCompactRounded-Semibold",
    color: "#7D7D7D",
    marginTop: -30,
    marginBottom: Platform.OS === "android" ? 50 : 70,
    textAlign: "center",
  },

  contentContainer: {
    alignItems: "center",
    width: "100%",
  },

  forgotPasswordButton: {
    width: 300,
    alignItems: "flex-end",
    paddingTop: 10,
    paddingBottom: 20,
  },

  forgotPasswordText: {
    fontSize: 15,
    fontFamily: "sf-rounded-regular",
    color: "#3797EF",
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "android" ? 90 : 120,
    left: 20,
    width: 37,
    height: 47,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
    alignItems: "center",
    marginBottom: 70,
  },

  registerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  registerText: {
    fontFamily: "sf-rounded-regular",
    fontSize: 16,
    color: "#7D7D7D",
  },

  registerLink: {
    fontFamily: "sf-rounded-regular",
    fontSize: 16,
    color: "#3797EF",
  },

  statusErrorText: {
    width: 300,
    color: "#E53935",
    fontSize: 14,
    marginTop: 16,
    textAlign: "center",
    fontFamily: "sf-rounded-regular",
  },

  passwordWrapper: {
    width: "100%",
    alignItems: "center",
    position: "relative",
    marginTop: 10,
  },

  eyeButton: {
    position: "absolute",
    right: 40,
    top: Platform.OS === "android" ? 10 : 12,
    padding: 6,
  },
});

export default LoginScreen;
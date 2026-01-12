import React, { useState } from "react";
import { View, StyleSheet, Platform, Text } from "react-native";
import {
  useNavigation,
  useRoute,
  CommonActions,
} from "@react-navigation/native";

import HeaderWithBack from "../../components/HeaderWithBack";
import CustomInput from "../../components/CustomInput";
import NextButton from "../../components/NextButton";
import { deductChildPoints } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useChildren } from "../../context/ChildrenContext";

const RemovePointsAmountScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAuth();
  const { refreshChildren } = useChildren();

  const { childId, childName } = route.params;

  const [points, setPoints] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (text) => {
    if (/^\d*$/.test(text)) {
      setPoints(text);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleSave = () => {
    if (!points) {
      setError(true);
      return;
    }

    if (loading) return;

    const parsed = parseInt(points, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      setError(true);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    deductChildPoints(childId, parsed, token)
      .then(async () => {
        await refreshChildren({ force: true });

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "ProfileParentMain" }],
          })
        );
      })
      .catch((err) => {
        const msg =
          err?.message || "Skidanje bodova nije uspjelo. Pokušajte ponovo.";
        setErrorMessage(msg);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack
          title="Skini bodove"
          subtitle="Upišite koliko bodova želite skinuti"
        />
      </View>

      <View style={styles.content}>
        <CustomInput
          placeholder="Broj bodova"
          value={points}
          onChangeText={handleChange}
          iconName="minus-circle-outline"
          keyboardType="number-pad"
          error={error}
        />

        {error && (
          <Text style={styles.errorText}>Unos mora biti isključivo broj</Text>
        )}
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <NextButton
          title={loading ? "Spremanje..." : "Sačuvaj"}
          onPress={handleSave}
          isDisabled={!points || loading}
        />
      </View>
    </View>
  );
};

export default RemovePointsAmountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  headerWrapper: {
    marginTop: Platform.OS === "android" ? 20 : 80,
  },

  content: {
    marginTop: 40,
    alignItems: "center",
  },

  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: "#E53935",
    fontFamily: "SFCompactRounded-Regular",
  },
});

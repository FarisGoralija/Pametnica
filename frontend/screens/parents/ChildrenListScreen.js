import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import HeaderWithBack from "../../components/HeaderWithBack";
import { useChildren } from "../../context/ChildrenContext";
import NextButton from "../../components/NextButton";

const ChildrenListScreen = () => {
  const navigation = useNavigation();
  const { childrenList, refreshChildren, loadingChildren, childrenError } =
    useChildren();

  useFocusEffect(
    useCallback(() => {
      refreshChildren();
    }, [refreshChildren])
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <HeaderWithBack title="Junior korisnici" subtitle="" />
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        {childrenError ? (
          <Text style={styles.errorText}>{childrenError}</Text>
        ) : null}
        {childrenList.length === 0 ? (
          <>
            <Text style={styles.emptyText}>
              Trenutno nemate registrovanog juniora.
            </Text>
            <View style={styles.emptyButtonWrapper}>
              <NextButton
                title="Dodaj junior korisnika"
                onPress={() => navigation.navigate("AddChild")}
              />
            </View>
          </>
        ) : (
          <>
            {/* CHILD CARDS */}
            {childrenList.map((child, index) => (
              <View key={index} style={styles.childCard}>
                <MaterialCommunityIcons
                  name="emoticon-happy-outline"
                  size={24}
                  color="#FAFAFA"
                />

                <View style={{ marginLeft: 14 }}>
                  <Text
                    style={styles.childLabel}
                    allowFontScaling={false}
                    includeFontPadding={false}
                  >
                    Ime i prezime
                  </Text>

                  <Text
                    style={styles.childName}
                    allowFontScaling={false}
                    includeFontPadding={false}
                  >
                {child.name || child.fullName || "Junior"}
                  </Text>
                </View>
              </View>
            ))}

            {/* ADD MORE */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("AddChild")}
            >
              <Text style={styles.addMoreText}>Dodaj junior korisnika</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default ChildrenListScreen;

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

  childCard: {
    backgroundColor: "#56A0E3",
    borderRadius: 10,
    minHeight: 72, // ✅ FIXED VISUAL HEIGHT
    paddingHorizontal: 16,
    paddingVertical: 10, // ⬅️ smaller than before
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  childLabel: {
    fontSize: 12,
    lineHeight: 14, // ✅ important
    color: "#FAFAFA",
    fontFamily: "SFCompactRounded-Regular",
  },

  childName: {
    fontSize: 16,
    lineHeight: 18, // ✅ important
    color: "#FAFAFA",
    fontFamily: "SFCompactRounded-Semibold",
  },

  addMoreText: {
    marginTop: 8,
    textAlign: "right",
    fontSize: 14,
    color: "#228390",
    fontFamily: "SFCompactRounded-Semibold",
  },

  emptyButtonWrapper: {
    marginTop: 16,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 14,
    fontFamily: "SFCompactRounded-Regular",
    color: "#7D7D7D",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 10,
  },

  errorText: {
    textAlign: "center",
    fontSize: 14,
    color: "#E53935",
    fontFamily: "SFCompactRounded-Regular",
    marginBottom: 12,
  },
});

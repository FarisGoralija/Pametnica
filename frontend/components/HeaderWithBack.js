import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const HeaderWithBack = ({ title, subtitle, onBack }) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack(); // ✅ custom back behavior
    } else {
      navigation.goBack(); // ✅ default behavior
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "#FFFFFF",
  },

  container: {
    width: "100%",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 20,
    paddingBottom: 30,
    alignItems: "center",
  },

  backButton: {
    position: "absolute",
    left: 16,
    top: Platform.OS === "android" ? StatusBar.currentHeight + 5 : 20,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  backIcon: {
    fontSize: 48,
    color: "#B0E5DD",
    lineHeight: 48,
  },

  textContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
  },

  title: {
    fontSize: 28,
    color: "#B0E5DD",
    marginBottom: 8,
    fontFamily: "SFCompactRounded-Bold",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#AFAFAF",
    textAlign: "center",
    fontFamily: "SFCompactRounded-Semibold",
  },
});

export default HeaderWithBack;

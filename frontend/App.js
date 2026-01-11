import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";

import Navigation from "./navigation";
import { AuthProvider } from "./context/AuthContext";
import { ChildrenProvider } from "./context/ChildrenContext";
import { ListProvider } from "./context/ListContext"; // ✅ ADD THIS

export default function App() {
  // Load fonts
  const [fontsLoaded] = useFonts({
    "SFCompactRounded-Bold": require("./assets/fonts/SF-Compact-Rounded-Bold.ttf"),
    "SFCompactRounded-Regular": require("./assets/fonts/SF-Compact-Rounded-Regular.ttf"),
    "SFCompactRounded-Semibold": require("./assets/fonts/SF-Compact-Rounded-Semibold.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <ChildrenProvider>
        <ListProvider>
          <Navigation />
        </ListProvider>
      </ChildrenProvider>
    </AuthProvider>
  );
}

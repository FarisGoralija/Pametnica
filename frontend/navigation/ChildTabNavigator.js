import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import HomeScreen from "../screens/kids/HomeScreen";
import ListsStackNavigator from "./ListsStackNavigator";
import ProfileChildStackNavigator from "./ProfileChildStackNavigator";

const Tab = createBottomTabNavigator();

export default function ChildTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

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

          // iOS shadow
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },

        // ⬆️ pull icons up slightly
        tabBarIconStyle: {
          marginTop: 12,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
        },

        tabBarActiveTintColor: "#228390",
        tabBarInactiveTintColor: "#7D7D7D",
      }}
    >
      {/* HOME */}
      <Tab.Screen
        name="Početna"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="home-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* LISTS */}
      {/* LISTS */}
      <Tab.Screen
        name="Liste"
        component={ListsStackNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="file-document-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* PROFILE */}
      <Tab.Screen
        name="Profil"
        component={ProfileChildStackNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="account-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import ListsScreen from "../screens/ListsScreen";
import ProfileParentStackNavigator from "./ProfileParentStackNavigator";

const Tab = createBottomTabNavigator();

export default function ParentTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          position: "absolute",
          bottom: 30,
          marginHorizontal: "5%",
          height: 78, // ⬅️ slightly taller
          paddingBottom: 8, // ⬅️ FIXES iOS CLIPPING
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

        // ⬅️ Pull icon UP instead of pushing text down
        tabBarIconStyle: {
          marginTop: 12,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2, // ⬅️ iOS-friendly
        },

        tabBarActiveTintColor: "#228390",
        tabBarInactiveTintColor: "#7D7D7D",
      }}
    >
      <Tab.Screen
        name="Liste"
        component={ListsScreen}
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
      <Tab.Screen
        name="Profil"
        component={ProfileParentStackNavigator}
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

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ParentListsStackNavigator from "./ParentListsStackNavigator";
import ProfileParentStackNavigator from "./ProfileParentStackNavigator";

const Tab = createBottomTabNavigator();

export default function ParentTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        safeAreaInsets: { bottom: 0 },

        tabBarStyle: {
          position: "absolute",
          bottom: 24,
          marginHorizontal: "5%",
          height: 78, // ⬅️ slightly taller
          paddingBottom: 10, // ⬅️ consistent cushion without relying on insets
          backgroundColor: "#4B9EF2",
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

        tabBarActiveTintColor: "#F2B84B",
        tabBarInactiveTintColor: "#FAFAFA",
      }}
    >
      <Tab.Screen
        name="Liste"
        component={ParentListsStackNavigator}
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

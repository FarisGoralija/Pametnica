import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

import AuthNavigator from "./AuthNavigator";
import ChildTabNavigator from "./ChildTabNavigator";
import ParentTabNavigator from "./ParentTabNavigator";

export default function RootNavigator() {
  const { isLoggedIn, role } = useAuth();

  return (
    <NavigationContainer>
      {!isLoggedIn ? (
        <AuthNavigator />
      ) : role === "child" ? (
        <ChildTabNavigator />
      ) : (
        <ParentTabNavigator />
      )}
    </NavigationContainer>
  );
}

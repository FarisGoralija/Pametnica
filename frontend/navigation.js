// Navigation.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ChooseRoleScreen from "./screens/ChooseRoleScreen";
import LoginScreen from "./screens/LoginScreen";
import RegistrationScreen from "./screens/RegistrationScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import CodeVerificationScreen from "./screens/CodeVerificationScreen";
import NewPasswordScreen from "./screens/NewPasswordScreen";

const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="ChooseRole"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="ChooseRole" component={ChooseRoleScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="RegistrationScreen" component={RegistrationScreen} />
        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
        <Stack.Screen name="CodeVerificationScreen" component={CodeVerificationScreen} />
        <Stack.Screen name="NewPasswordScreen" component={NewPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
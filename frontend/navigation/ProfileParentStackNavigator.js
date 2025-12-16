import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProfileParentScreen from "../screens/ProfileParentScreen";
import ProfileDetailsParentScreen from "../screens/ProfileDetailsParentScreen";

const Stack = createNativeStackNavigator();

export default function ProfileParentStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="ProfileParentMain"
        component={ProfileParentScreen}
      />
      <Stack.Screen
        name="ProfileDetailsParent"
        component={ProfileDetailsParentScreen}
      />
    </Stack.Navigator>
  );
}

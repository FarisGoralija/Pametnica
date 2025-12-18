import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProfileChildScreen from "../screens/kids/ProfileChildScreen";
import ProfileDetailsChildScreen from "../screens/kids/ProfileDetailsChildScreen";

const Stack = createNativeStackNavigator();

export default function ProfileChildStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileChildMain" component={ProfileChildScreen} />
      <Stack.Screen
        name="ProfileDetailsChild"
        component={ProfileDetailsChildScreen}
      />
    </Stack.Navigator>
  );
}

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProfileParentScreen from "../screens/ProfileParentScreen";
import ProfileDetailsParentScreen from "../screens/ProfileDetailsParentScreen";
import ChildrenListScreen from "../screens/ChildrenListScreen";
import AddChildScreen from "../screens/AddChildScreen";

const Stack = createNativeStackNavigator();

export default function ProfileParentStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileParentMain" component={ProfileParentScreen} />
      <Stack.Screen
        name="ProfileDetailsParent"
        component={ProfileDetailsParentScreen}
      />
      <Stack.Screen name="ChildrenList" component={ChildrenListScreen} />
      <Stack.Screen name="AddChild" component={AddChildScreen} />
    </Stack.Navigator>
  );
}

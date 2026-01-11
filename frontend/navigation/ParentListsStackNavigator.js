import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SelectChildScreen from "../screens/parents/SelectChildScreen";
import ParentListsScreen from "../screens/parents/ListsScreen";
import ParentNewListScreen from "../screens/parents/NewListScreen";
import ParentListDetailsScreen from "../screens/parents/ListDetailsScreen";

const Stack = createNativeStackNavigator();

export default function ParentListsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* FIRST SCREEN */}
      <Stack.Screen name="SelectChild" component={SelectChildScreen} />

      {/* AFTER CHILD IS SELECTED */}
      <Stack.Screen name="ParentListsMain" component={ParentListsScreen} />

      <Stack.Screen name="ParentNewList" component={ParentNewListScreen} />

      <Stack.Screen
        name="ParentListDetails"
        component={ParentListDetailsScreen}
      />
    </Stack.Navigator>
  );
}

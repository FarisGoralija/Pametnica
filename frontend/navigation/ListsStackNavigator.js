import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ListsScreen from "../screens/kids/ListsScreen";
import NewListScreen from "../screens/kids/NewListScreen";
import ListDetailsScreen from "../screens/kids/ListDetailsScreen";

const Stack = createNativeStackNavigator();

export default function ListsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListsMain" component={ListsScreen} />
      <Stack.Screen name="NewListScreen" component={NewListScreen} />
      <Stack.Screen name="ListDetailsScreen" component={ListDetailsScreen} />
      {/* <Stack.Screen name="UrgentListScreen" component={UrgentListScreen} /> */}
    </Stack.Navigator>
  );
}

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProfileParentScreen from "../screens/parents/ProfileParentScreen";
import ProfileDetailsParentScreen from "../screens/parents/ProfileDetailsParentScreen";
import ChildrenListScreen from "../screens/parents/ChildrenListScreen";
import AddChildScreen from "../screens/parents/AddChildScreen";
import ChooseChildForBudgetScreen from "../screens/parents/ChooseChildForBudgetScreen";
import SetBudgetAmountScreen from "../screens/parents/SetBudgetAmountScreen";
import ChooseChildForPointsScreen from "../screens/parents/ChooseChildForPointsScreen";
import RemovePointsAmountScreen from "../screens/parents/RemovePointsAmountScreen";

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
      <Stack.Screen
        name="ChooseChildForBudget"
        component={ChooseChildForBudgetScreen}
      />

      <Stack.Screen name="SetBudgetAmount" component={SetBudgetAmountScreen} />
      <Stack.Screen
        name="ChooseChildForPoints"
        component={ChooseChildForPointsScreen}
      />

      <Stack.Screen
        name="RemovePointsAmount"
        component={RemovePointsAmountScreen}
      />
    </Stack.Navigator>
  );
}

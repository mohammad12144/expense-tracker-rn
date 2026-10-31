import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { EditExpenseScreen } from '../screens/EditExpenseScreen';
import { ExpenseDetailsScreen } from '../screens/ExpenseDetailsScreen';
import { AuthNavigator } from './AuthNavigator';
import { MainTabs } from './MainTabs';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user } = useAuth();

  // Signed out: only the auth screens exist. Signed in: the app screens.
  if (!user) return <AuthNavigator />;

  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="ExpenseDetails"
        component={ExpenseDetailsScreen}
        options={{ title: 'Expense' }}
      />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{ title: 'New expense', presentation: 'modal' }}
      />
      <Stack.Screen
        name="EditExpense"
        component={EditExpenseScreen}
        options={{ title: 'Edit expense', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
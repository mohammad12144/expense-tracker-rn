import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../components/SplashScreen';
import { useAuth } from '../context/AuthContext';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { EditExpenseScreen } from '../screens/EditExpenseScreen';
import { ExpenseDetailsScreen } from '../screens/ExpenseDetailsScreen';
import { AuthNavigator } from './AuthNavigator';
import { MainTabs } from './MainTabs';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { status } = useAuth();

  // Checking for a saved session: show a splash so Login does not flash.
  if (status === 'loading') return <SplashScreen />;
  // Signed out: only the auth screens exist. Signed in: the app screens.
  if (status === 'signedOut') return <AuthNavigator />;

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
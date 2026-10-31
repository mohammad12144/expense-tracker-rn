import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { ExpensesScreen } from '../screens/ExpensesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { theme } from '../theme';
import { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

export function MainTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: theme.colors.primary,
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={route.name === 'Expenses' ? 'wallet-outline' : 'person-outline'}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{ title: user ? `Hi, ${user.name}` : 'Expenses', tabBarLabel: 'Expenses' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View } from 'react-native';
import { ExpensesScreen } from './src/screens/ExpensesScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { AuthUser } from './src/services/mockAuth';
import { theme } from './src/theme';

type AuthScreen = 'login' | 'register';

export default function App() {
  const [screen, setScreen] = useState<AuthScreen>('login');
  const [user, setUser] = useState<AuthUser | null>(null);

  const logout = () => {
    setUser(null);
    setScreen('login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style="dark" />
      {user ? (
        <ExpensesScreen user={user} onLogout={logout} />
      ) : screen === 'login' ? (
        <LoginScreen onLoggedIn={setUser} onGoRegister={() => setScreen('register')} />
      ) : (
        <RegisterScreen onRegistered={setUser} onGoLogin={() => setScreen('login')} />
      )}
    </View>
  );
}
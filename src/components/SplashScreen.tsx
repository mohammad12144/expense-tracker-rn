import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { theme } from '../theme';
import { AppLogo } from './AppLogo';

export function SplashScreen() {
  return (
    <View style={styles.screen} accessibilityRole="progressbar">
      <AppLogo />
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
});
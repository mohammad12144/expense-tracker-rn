import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

interface Props {
  size?: number;
}

export function AppLogo({ size = 72 }: Props) {
  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Ionicons name="wallet-outline" size={size * 0.5} color={theme.colors.primary} />
      </View>
      <Text style={styles.name}>Expense Tracker</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: theme.spacing.sm },
  circle: {
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
});
import { StyleSheet, Text, View } from 'react-native';
import { LoadingButton } from '../components/LoadingButton';
import { useAuth } from '../context/AuthContext';
import { useExpensesStore } from '../context/ExpensesContext';
import { theme } from '../theme';
import { formatMoney } from '../utils/format';

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { expenses } = useExpensesStore();
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const initial = (user?.name ?? '?').charAt(0).toUpperCase();

  return (
    <View style={styles.screen}>
      <View style={styles.avatar}>
        <Text style={styles.initial}>{initial}</Text>
      </View>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.stats}>
        <Text style={styles.statLabel}>Expenses</Text>
        <Text style={styles.statValue}>{expenses.length}</Text>
        <Text style={styles.statLabel}>Total spent</Text>
        <Text style={styles.statValue}>{formatMoney(total)}</Text>
      </View>

      <LoadingButton label="Log out" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontSize: 36, fontWeight: '700', color: theme.colors.primary },
  name: { fontSize: 22, fontWeight: '700', color: theme.colors.text },
  email: { color: theme.colors.muted },
  stats: {
    alignSelf: 'stretch',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
    marginVertical: theme.spacing.lg,
  },
  statLabel: { color: theme.colors.muted, fontSize: 13 },
  statValue: { fontSize: 20, fontWeight: '600', color: theme.colors.text },
});
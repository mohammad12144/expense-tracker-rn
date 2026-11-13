import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useExpenseStore } from '../store/expensesStore';
import { theme } from '../theme';

/** Small status line for the cloud sync: loading, or the reason it failed. */
export function SyncBanner() {
  const status = useExpenseStore((s) => s.syncStatus);
  const error = useExpenseStore((s) => s.syncError);

  if (status === 'loading') {
    return (
      <View style={styles.row} accessibilityRole="progressbar">
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.muted}>Syncing your expenses...</Text>
      </View>
    );
  }
  if (status === 'error') {
    return (
      <Text style={styles.error} accessibilityRole="alert">
        {`Sync problem: ${error ?? 'unknown error'}`}
      </Text>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  muted: { color: theme.colors.muted },
  error: {
    backgroundColor: '#fdeceb',
    color: theme.colors.error,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
});
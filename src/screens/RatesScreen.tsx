import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Chip } from '../components/Chip';
import { ErrorState } from '../components/ErrorState';
import { SummaryCard } from '../components/SummaryCard';
import { useExpensesStore } from '../context/ExpensesContext';
import { useAsync } from '../hooks/useAsync';
import { getRates, RatesClient } from '../services/api/rates';
import { theme } from '../theme';
import { convert, formatRate } from '../utils/currency';
import { formatMoney } from '../utils/format';

const TARGETS = ['EUR', 'GBP', 'JOD', 'ILS', 'SAR', 'AED', 'TRY', 'EGP'];
const CLIENTS: { key: RatesClient; label: string }[] = [
  { key: 'axios', label: 'Axios' },
  { key: 'fetch', label: 'fetch' },
];

export function RatesScreen() {
  const { expenses } = useExpensesStore();
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const [client, setClient] = useState<RatesClient>('axios');
  const task = useCallback((signal: AbortSignal) => getRates(client, 'USD', { signal }), [client]);
  const { data, error, loading, reload } = useAsync(task);

  const rows = data
    ? TARGETS.filter((code) => data.rates[code] !== undefined).map((code) => ({
        code,
        rate: data.rates[code],
      }))
    : [];

  return (
    <View style={styles.screen}>
      <View style={styles.row}>
        <SummaryCard label="Your total (USD)" value={formatMoney(total)} />
      </View>

      <View style={styles.sortRow}>
        <Text style={styles.muted}>HTTP client</Text>
        <View style={styles.chips}>
          {CLIENTS.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              selected={client === c.key}
              onPress={() => setClient(c.key)}
            />
          ))}
        </View>
      </View>

      {loading && !data ? (
        <View style={styles.center} accessibilityRole="progressbar">
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.muted}>Loading rates...</Text>
        </View>
      ) : null}

      {error && !data ? (
        <View style={styles.center}>
          <ErrorState message={error.userMessage} onRetry={reload} />
        </View>
      ) : null}

      {data ? (
        <>
          {error ? (
            <Text style={styles.banner} onPress={reload}>
              {`${error.userMessage} Showing the last loaded rates. Tap to retry.`}
            </Text>
          ) : null}
          <View style={styles.sortRow}>
            <Text style={styles.muted}>{data.updated || 'Latest rates'}</Text>
            {loading ? <ActivityIndicator color={theme.colors.primary} /> : null}
          </View>
          <FlatList
            data={rows}
            keyExtractor={(r) => r.code}
            refreshing={loading}
            onRefresh={reload}
            renderItem={({ item }) => (
              <View style={styles.rate}>
                <View>
                  <Text style={styles.code}>{item.code}</Text>
                  <Text style={styles.muted}>{`1 USD = ${formatRate(item.rate)}`}</Text>
                </View>
                <Text style={styles.converted}>
                  {`${convert(total, item.rate).toFixed(2)} ${item.code}`}
                </Text>
              </View>
            )}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.md,
  },
  row: { flexDirection: 'row', gap: 10 },
  chips: { flexDirection: 'row', gap: theme.spacing.sm },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md },
  muted: { color: theme.colors.muted },
  banner: {
    backgroundColor: '#fdeceb',
    color: theme.colors.error,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  rate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  code: { fontWeight: '700', color: theme.colors.text },
  converted: { fontWeight: '600', color: theme.colors.primary },
});
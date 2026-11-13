import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Chip } from '../components/Chip';
import { ErrorState } from '../components/ErrorState';
import { SummaryCard } from '../components/SummaryCard';
import { useRatesQuery } from '../hooks/useRatesQuery';
import { RatesClient } from '../services/api/rates';
import { selectTotal, useExpenseStore } from '../store/expensesStore';
import { CURRENCIES, usePreferences } from '../store/preferencesStore';
import { theme } from '../theme';
import { convert, formatRate } from '../utils/currency';
import { formatMoney } from '../utils/format';

const CLIENTS: { key: RatesClient; label: string }[] = [
  { key: 'axios', label: 'Axios' },
  { key: 'fetch', label: 'fetch' },
];

export function RatesScreen() {
  const total = useExpenseStore(selectTotal);
  const client = usePreferences((s) => s.client);
  const setClient = usePreferences((s) => s.setClient);
  const targets = usePreferences((s) => s.targets);
  const toggleTarget = usePreferences((s) => s.toggleTarget);

  const { data, error, isPending, isFetching, isRefetching, refetch } = useRatesQuery(client);

  const rows = data
    ? targets
        .filter((code) => data.rates[code] !== undefined)
        .map((code) => ({ code, rate: data.rates[code] }))
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

      <View style={styles.chips}>
        {CURRENCIES.map((code) => (
          <Chip
            key={code}
            label={code}
            selected={targets.includes(code)}
            onPress={() => toggleTarget(code)}
          />
        ))}
      </View>

      {isPending ? (
        <View style={styles.center} accessibilityRole="progressbar">
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.muted}>Loading rates...</Text>
        </View>
      ) : null}

      {error && !data ? (
        <View style={styles.center}>
          <ErrorState message={error.userMessage} onRetry={() => void refetch()} />
        </View>
      ) : null}

      {data ? (
        <>
          {error ? (
            <Text style={styles.banner} onPress={() => void refetch()}>
              {`${error.userMessage} Showing the last loaded rates. Tap to retry.`}
            </Text>
          ) : null}
          <View style={styles.sortRow}>
            <Text style={styles.muted}>{data.updated || 'Latest rates'}</Text>
            {isFetching ? <ActivityIndicator color={theme.colors.primary} /> : null}
          </View>
          <FlatList
            data={rows}
            keyExtractor={(r) => r.code}
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
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
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { ExpenseTile } from '../components/ExpenseTile';
import { SummaryCard } from '../components/SummaryCard';
import { useExpensesStore } from '../context/ExpensesContext';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { SortMode, useExpenses } from '../hooks/useExpenses';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { theme } from '../theme';
import { CATEGORIES } from '../types/expense';
import { formatMoney } from '../utils/format';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Expenses'>,
  NativeStackScreenProps<RootStackParamList>
>;

const SORTS: { key: SortMode; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'amount', label: 'Highest' },
];

export function ExpensesScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search, 300);
  const { sections, count, category, setCategory, sort, setSort, remove, total, thisMonth } =
    useExpenses(query);
  const { getById } = useExpensesStore();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const filtering = search.trim() !== '' || category !== 'All';
  const pending = pendingDelete ? getById(pendingDelete) : undefined;

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.row}>
        <SummaryCard label="Total" value={formatMoney(total)} />
        <SummaryCard label="This month" value={formatMoney(thisMonth)} />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Search expenses"
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.chips}>
        {(['All', ...CATEGORIES] as const).map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(c)}
            style={[styles.chip, category === c && styles.chipOn]}
          >
            <Text>{c}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sortRow}>
        <Text style={styles.muted}>{`${count} expense${count === 1 ? '' : 's'}`}</Text>
        <View style={styles.chips}>
          {SORTS.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => setSort(s.key)}
              style={[styles.chip, sort === s.key && styles.chipOn]}
            >
              <Text>{s.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(e) => e.id}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionTotal}>{formatMoney(section.total)}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ExpenseTile
            expense={item}
            onPress={(id) => navigation.navigate('ExpenseDetails', { id })}
            onDelete={setPendingDelete}
          />
        )}
        ListEmptyComponent={
          filtering ? (
            <EmptyState
              icon="search-outline"
              title="No matches"
              message="Try a different search or category."
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          ) : (
            <EmptyState
              title="No expenses yet"
              message="Add your first expense to get started."
              actionLabel="Add expense"
              onAction={() => navigation.navigate('AddExpense')}
            />
          )
        }
        contentContainerStyle={{ paddingBottom: 96 }}
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('AddExpense')}>
        <Text style={styles.fabText}>+ Add expense</Text>
      </Pressable>

      <ConfirmDialog
        visible={pendingDelete !== null}
        title="Delete expense?"
        message={pending ? `"${pending.title}" will be removed.` : ''}
        onConfirm={() => {
          if (pendingDelete) remove(pendingDelete);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
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
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 10,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  chip: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipOn: { backgroundColor: theme.colors.primaryLight, borderColor: '#9a82db' },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  muted: { color: theme.colors.muted },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  sectionTitle: { fontWeight: '700', color: theme.colors.text },
  sectionTotal: { color: theme.colors.muted },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  fabText: { color: '#fff', fontWeight: '600' },
});
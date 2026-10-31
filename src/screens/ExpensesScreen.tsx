import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ExpenseTile } from '../components/ExpenseTile';
import { SummaryCard } from '../components/SummaryCard';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useExpenses } from '../hooks/useExpenses';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { theme } from '../theme';
import { CATEGORIES } from '../types/expense';
import { formatMoney } from '../utils/format';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Expenses'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function ExpensesScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search, 300);
  const { visible, category, setCategory, remove, total, thisMonth } = useExpenses(query);

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

      <FlatList
        data={visible}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => (
          <ExpenseTile
            expense={item}
            onPress={(id) => navigation.navigate('ExpenseDetails', { id })}
            onDelete={remove}
          />
        )}
        ListEmptyComponent={<Text style={{ color: theme.colors.muted }}>No expenses</Text>}
        contentContainerStyle={{ paddingBottom: 96 }}
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('AddExpense')}>
        <Text style={styles.fabText}>+ Add expense</Text>
      </Pressable>
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
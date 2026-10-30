import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ExpenseTile } from '../components/ExpenseTile';
import { SummaryCard } from '../components/SummaryCard';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useExpenses } from '../hooks/useExpenses';
import { AuthUser } from '../services/mockAuth';
import { theme } from '../theme';
import { CATEGORIES } from '../types/expense';
import { formatMoney } from '../utils/format';

interface Props {
  user: AuthUser;
  onLogout: () => void;
}

export function ExpensesScreen({ user, onLogout }: Props) {
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search, 300);
  const { visible, category, setCategory, add, remove, total, thisMonth } =
    useExpenses(query);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const value = Number(amount);
    if (!title.trim()) return setError('Title is required');
    if (!Number.isFinite(value) || value <= 0) return setError('Amount must be positive');
    add({
      title: title.trim(),
      amount: value,
      category: category === 'All' ? 'Other' : category,
      date: new Date().toISOString().slice(0, 10),
    });
    setTitle('');
    setAmount('');
    setError(null);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.h1}>Hi, {user.name}</Text>
        <Pressable onPress={onLogout}>
          <Text style={styles.logout}>Log out</Text>
        </Pressable>
      </View>

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

      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 2 }]}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <Pressable style={styles.add} onPress={submit}>
          <Text style={{ color: '#fff' }}>Add</Text>
        </Pressable>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={visible}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => <ExpenseTile expense={item} onDelete={remove} />}
        ListEmptyComponent={<Text style={{ color: theme.colors.muted }}>No expenses</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.md,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  h1: { fontSize: 24, fontWeight: '700', color: theme.colors.text },
  logout: { color: theme.colors.primary, fontWeight: '600' },
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
  add: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  error: { color: theme.colors.error },
});
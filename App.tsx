import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ExpenseTile } from './src/components/ExpenseTile';
import { SummaryCard } from './src/components/SummaryCard';
import { useDebouncedValue } from './src/hooks/useDebouncedValue';
import { useExpenses } from './src/hooks/useExpenses';
import { CATEGORIES } from './src/types/expense';
import { formatMoney } from './src/utils/format';

export default function App() {
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
      <StatusBar style="dark" />
      <Text style={styles.h1}>Expense Tracker</Text>

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
        ListEmptyComponent={<Text style={{ color: '#666' }}>No expenses</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 56, paddingHorizontal: 16, backgroundColor: '#fff', gap: 12 },
  h1: { fontSize: 24, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#aaa', borderRadius: 10, padding: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: '#ccc', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12 },
  chipOn: { backgroundColor: '#e6e0f5', borderColor: '#9a82db' },
  add: { backgroundColor: '#5b3fc4', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16 },
  error: { color: '#b3261e' },
});
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Expense } from '../types/expense';
import { formatMoney } from '../utils/format';

interface Props {
  expense: Expense;
  onPress: (id: string) => void;
  onDelete: (id: string) => void;
}

function ExpenseTileBase({ expense, onPress, onDelete }: Props) {
  return (
    <Pressable onPress={() => onPress(expense.id)} style={styles.tile}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{expense.title}</Text>
        <Text style={styles.sub}>
          {`${expense.category} \u2022 ${expense.date}`}
        </Text>
      </View>
      <Text style={styles.amount}>{formatMoney(expense.amount)}</Text>
      <Pressable onPress={() => onDelete(expense.id)} style={styles.del}>
        <Text style={{ color: '#b3261e' }}>Delete</Text>
      </Pressable>
    </Pressable>
  );
}

export const ExpenseTile = memo(ExpenseTileBase);

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f5fb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  title: { fontSize: 16, fontWeight: '500' },
  sub: { color: '#666', fontSize: 12, marginTop: 2 },
  amount: { fontWeight: '600' },
  del: { padding: 6 },
});
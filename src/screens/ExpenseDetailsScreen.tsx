import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingButton } from '../components/LoadingButton';
import { useExpensesStore } from '../context/ExpensesContext';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';
import { formatMoney } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'ExpenseDetails'>;

export function ExpenseDetailsScreen({ route, navigation }: Props) {
  const { getById, remove } = useExpensesStore();
  const expense = getById(route.params.id);
  const [confirming, setConfirming] = useState(false);

  if (!expense) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>This expense no longer exists.</Text>
        <LoadingButton label="Go back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const onDelete = () => {
    setConfirming(false);
    navigation.goBack();
    remove(expense.id);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.amount}>{formatMoney(expense.amount)}</Text>
        <Text style={styles.title}>{expense.title}</Text>
        <View style={styles.line}>
          <Text style={styles.muted}>Category</Text>
          <Text style={styles.value}>{expense.category}</Text>
        </View>
        <View style={styles.line}>
          <Text style={styles.muted}>Date</Text>
          <Text style={styles.value}>{expense.date}</Text>
        </View>
        {expense.note ? (
          <View style={styles.line}>
            <Text style={styles.muted}>Note</Text>
            <Text style={styles.value}>{expense.note}</Text>
          </View>
        ) : null}
      </View>

      <LoadingButton
        label="Edit expense"
        onPress={() => navigation.navigate('EditExpense', { id: expense.id })}
      />

      <Pressable style={styles.delete} onPress={() => setConfirming(true)}>
        <Text style={styles.deleteText}>Delete expense</Text>
      </Pressable>

      <ConfirmDialog
        visible={confirming}
        title="Delete expense?"
        message={`"${expense.title}" will be removed.`}
        onConfirm={onDelete}
        onCancel={() => setConfirming(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  amount: { fontSize: 36, fontWeight: '700', color: theme.colors.primary },
  title: { fontSize: 20, fontWeight: '600', color: theme.colors.text },
  line: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.lg },
  muted: { color: theme.colors.muted },
  value: { color: theme.colors.text, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  delete: {
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteText: { color: theme.colors.error, fontWeight: '600' },
});
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useForm } from '../hooks/useForm';
import { theme } from '../theme';
import { CATEGORIES, Category, Expense } from '../types/expense';
import { validateAmount, validateDate } from '../utils/expenseValidators';
import { validateRequired } from '../utils/validators';
import { Chip } from './Chip';
import { CustomTextField } from './CustomTextField';
import { LoadingButton } from './LoadingButton';

interface Props {
  initial?: Expense;
  submitLabel: string;
  onSubmit: (values: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
}

export function ExpenseForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [category, setCategory] = useState<Category>(initial?.category ?? 'Food');
  const form = useForm(
    {
      title: initial?.title ?? '',
      amount: initial ? String(initial.amount) : '',
      date: initial?.date ?? new Date().toISOString().slice(0, 10),
      note: initial?.note ?? '',
    },
    {
      title: validateRequired('Title'),
      amount: validateAmount,
      date: validateDate,
    },
  );

  const submit = form.handleSubmit((v) => {
    const note = v.note.trim();
    onSubmit({
      title: v.title.trim(),
      amount: Number(v.amount),
      category,
      date: v.date,
      note: note ? note : undefined,
    });
  });

  return (
    <View style={styles.form}>
      <CustomTextField
        label="Title"
        icon="create-outline"
        value={form.values.title}
        onChangeText={(t) => form.setValue('title', t)}
        onBlur={() => form.setFieldTouched('title')}
        error={form.errorOf('title')}
        autoCapitalize="sentences"
        placeholder="e.g. Coffee"
      />
      <CustomTextField
        label="Amount"
        icon="cash-outline"
        value={form.values.amount}
        onChangeText={(t) => form.setValue('amount', t)}
        onBlur={() => form.setFieldTouched('amount')}
        error={form.errorOf('amount')}
        keyboardType="numeric"
        placeholder="0.00"
      />
      <CustomTextField
        label="Date (YYYY-MM-DD)"
        icon="calendar-outline"
        value={form.values.date}
        onChangeText={(t) => form.setValue('date', t)}
        onBlur={() => form.setFieldTouched('date')}
        error={form.errorOf('date')}
        placeholder="2026-10-31"
      />
      <CustomTextField
        label="Note (optional)"
        icon="document-text-outline"
        value={form.values.note}
        onChangeText={(t) => form.setValue('note', t)}
        autoCapitalize="sentences"
        placeholder="Anything to remember"
      />

      <View style={{ gap: theme.spacing.sm }}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => (
            <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </View>
      </View>

      <LoadingButton label={submitLabel} onPress={submit} />
      <LoadingButton label="Cancel" variant="secondary" onPress={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.spacing.lg },
  label: { fontSize: 13, color: theme.colors.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
});
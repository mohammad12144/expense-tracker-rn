import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CustomTextField } from '../components/CustomTextField';
import { LoadingButton } from '../components/LoadingButton';
import { useExpensesStore } from '../context/ExpensesContext';
import { useForm } from '../hooks/useForm';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';
import { CATEGORIES, Category } from '../types/expense';
import { FieldError, validateRequired } from '../utils/validators';

type Props = NativeStackScreenProps<RootStackParamList, 'AddExpense'>;

const validateAmount = (value: string): FieldError => {
  const n = Number(value);
  return value.trim() && Number.isFinite(n) && n > 0 ? null : 'Enter an amount greater than 0';
};

export function AddExpenseScreen({ navigation }: Props) {
  const { add } = useExpensesStore();
  const [category, setCategory] = useState<Category>('Food');
  const form = useForm(
    { title: '', amount: '' },
    { title: validateRequired('Title'), amount: validateAmount },
  );

  const submit = form.handleSubmit((v) => {
    add({
      title: v.title.trim(),
      amount: Number(v.amount),
      category,
      date: new Date().toISOString().slice(0, 10),
    });
    navigation.goBack();
  });

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
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

      <View style={{ gap: theme.spacing.sm }}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCategory(c)}
              style={[styles.chip, category === c && styles.chipOn]}
            >
              <Text>{c}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <LoadingButton label="Save expense" onPress={submit} />
      <LoadingButton label="Cancel" variant="secondary" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    flexGrow: 1,
  },
  label: { fontSize: 13, color: theme.colors.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  chip: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipOn: { backgroundColor: theme.colors.primaryLight, borderColor: '#9a82db' },
});
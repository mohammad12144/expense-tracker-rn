import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet } from 'react-native';
import { ExpenseForm } from '../components/ExpenseForm';
import { NotFoundState } from '../components/NotFoundState';
import { RootStackParamList } from '../navigation/types';
import { selectExpenseById, useExpenseStore } from '../store/expensesStore';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EditExpense'>;

export function EditExpenseScreen({ route, navigation }: Props) {
  const expense = useExpenseStore(selectExpenseById(route.params.id));
  const update = useExpenseStore((s) => s.update);

  if (!expense) {
    return (
      <NotFoundState
        message="This expense no longer exists."
        onBack={() => navigation.goBack()}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <ExpenseForm
        initial={expense}
        submitLabel="Save changes"
        onSubmit={(values) => {
          update(expense.id, values);
          navigation.goBack();
        }}
        onCancel={() => navigation.goBack()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    flexGrow: 1,
  },
});
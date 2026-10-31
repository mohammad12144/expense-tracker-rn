import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet } from 'react-native';
import { ExpenseForm } from '../components/ExpenseForm';
import { useExpensesStore } from '../context/ExpensesContext';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AddExpense'>;

export function AddExpenseScreen({ navigation }: Props) {
  const { add } = useExpensesStore();

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <ExpenseForm
        submitLabel="Save expense"
        onSubmit={(values) => {
          add(values);
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
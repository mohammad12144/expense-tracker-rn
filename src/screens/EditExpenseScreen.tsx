import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ExpenseForm } from '../components/ExpenseForm';
import { LoadingButton } from '../components/LoadingButton';
import { useExpensesStore } from '../context/ExpensesContext';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EditExpense'>;

export function EditExpenseScreen({ route, navigation }: Props) {
  const { getById, update } = useExpensesStore();
  const expense = getById(route.params.id);

  if (!expense) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>This expense no longer exists.</Text>
        <LoadingButton label="Go back" onPress={() => navigation.goBack()} />
      </View>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  muted: { color: theme.colors.muted },
});
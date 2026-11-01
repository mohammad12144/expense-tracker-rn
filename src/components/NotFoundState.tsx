import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { LoadingButton } from './LoadingButton';

interface Props {
  message: string;
  onBack: () => void;
}

export function NotFoundState({ message, onBack }: Props) {
  return (
    <View style={styles.center}>
      <Text style={styles.message}>{message}</Text>
      <LoadingButton label="Go back" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  message: { color: theme.colors.muted },
});
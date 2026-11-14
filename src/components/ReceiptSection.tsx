import { useState } from 'react';
import { Image, Linking, StyleSheet, Text, View } from 'react-native';
import { expoPicker } from '../services/media/expoPicker';
import {
  PickResult,
  pickProblemMessage,
  pickReceipt,
  ReceiptSource,
} from '../services/media/receiptPicker';
import { selectReceipt, useReceipts } from '../store/receiptsStore';
import { theme } from '../theme';
import { LoadingButton } from './LoadingButton';

interface Props {
  expenseId: string;
}

export function ReceiptSection({ expenseId }: Props) {
  const uri = useReceipts(selectReceipt(expenseId));
  const setReceipt = useReceipts((s) => s.setReceipt);
  const removeReceipt = useReceipts((s) => s.removeReceipt);
  const [busy, setBusy] = useState<ReceiptSource | null>(null);
  const [problem, setProblem] = useState<PickResult | null>(null);

  const choose = async (source: ReceiptSource) => {
    setBusy(source);
    setProblem(null);
    const result = await pickReceipt(source, expoPicker);
    setBusy(null);
    if (result.kind === 'picked') setReceipt(expenseId, result.uri);
    else setProblem(result);
  };

  const message = problem ? pickProblemMessage(problem) : null;
  const needsSettings = problem?.kind === 'denied' && !problem.canAskAgain;

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Receipt</Text>

      {uri ? (
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel="Receipt photo"
        />
      ) : (
        <Text style={styles.muted}>No receipt attached.</Text>
      )}

      {message ? (
        <Text style={styles.problem} accessibilityRole="alert">
          {message}
        </Text>
      ) : null}
      {needsSettings ? (
        <LoadingButton
          label="Open Settings"
          variant="secondary"
          onPress={() => void Linking.openSettings()}
        />
      ) : null}

      <LoadingButton
        label="Take a photo"
        onPress={() => void choose('camera')}
        loading={busy === 'camera'}
        disabled={busy !== null}
      />
      <LoadingButton
        label="Choose from gallery"
        variant="secondary"
        onPress={() => void choose('library')}
        loading={busy === 'library'}
        disabled={busy !== null}
      />
      {uri ? (
        <LoadingButton
          label="Remove photo"
          variant="secondary"
          onPress={() => removeReceipt(expenseId)}
          disabled={busy !== null}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  title: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  muted: { color: theme.colors.muted },
  image: { width: '100%', height: 220, borderRadius: theme.radius.md },
  problem: {
    backgroundColor: '#fdeceb',
    color: theme.colors.error,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
});
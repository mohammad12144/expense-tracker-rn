import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={styles.confirm}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  box: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  title: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  message: { color: theme.colors.muted },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.md },
  cancel: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelText: { color: theme.colors.primary, fontWeight: '600' },
  confirm: {
    backgroundColor: theme.colors.error,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  confirmText: { color: '#fff', fontWeight: '600' },
});
import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { LoadingButton } from './LoadingButton';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface Props {
  icon?: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'receipt-outline',
  title,
  message,
  actionLabel,
  onAction,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={48} color={theme.colors.muted} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <LoadingButton label={actionLabel} onPress={onAction} variant="secondary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: theme.spacing.sm, paddingVertical: theme.spacing.xl },
  title: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  message: { color: theme.colors.muted, textAlign: 'center' },
});
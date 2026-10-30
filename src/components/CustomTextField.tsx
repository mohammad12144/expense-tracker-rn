import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, useState } from 'react';
import {
  KeyboardTypeOptions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { theme } from '../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string | null;
  icon?: IconName;
  secure?: boolean;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

// The browser draws its own focus ring on web; we draw a border on the container instead.
const noWebOutline = Platform.OS === 'web' ? ({ outlineWidth: 0 } as object) : {};

export function CustomTextField({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  icon,
  secure = false,
  placeholder,
  keyboardType,
  autoCapitalize = 'none',
}: Props) {
  const [hidden, setHidden] = useState(secure);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.box,
          focused && styles.boxFocused,
          error ? styles.boxError : null,
        ]}
      >
        {icon && <Ionicons name={icon} size={20} color={theme.colors.muted} />}
        <TextInput
          style={[styles.input, noWebOutline]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
        {secure && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={theme.colors.muted}
            />
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing.xs },
  label: { fontSize: 13, color: theme.colors.muted },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
  },
  boxFocused: { borderColor: theme.colors.primary },
  boxError: { borderColor: theme.colors.error },
  input: { flex: 1, paddingVertical: 12, fontSize: 16 },
  error: { color: theme.colors.error, fontSize: 12 },
});
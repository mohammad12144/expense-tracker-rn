import { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AppLogo } from '../components/AppLogo';
import { AuthLayout } from '../components/AuthLayout';
import { CustomTextField } from '../components/CustomTextField';
import { LoadingButton } from '../components/LoadingButton';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks/useForm';
import { theme } from '../theme';
import {
  validateConfirm,
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/validators';

interface Props {
  onGoLogin: () => void;
}

export function RegisterScreen({ onGoLogin }: Props) {
  const { signUp, configured } = useAuth();
  // The "confirm" validator needs the current password value.
  const password = useRef('');
  const form = useForm(
    { name: '', email: '', password: '', confirm: '' },
    {
      name: validateName,
      email: validateEmail,
      password: validatePassword,
      confirm: validateConfirm(() => password.current),
    },
  );
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const submit = form.handleSubmit(async (v) => {
    setLoading(true);
    setServerError(null);
    try {
      await signUp(v.name.trim(), v.email.trim(), v.password);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthLayout>
      <AppLogo />
      <Text style={styles.title}>Create your account</Text>

      <CustomTextField
        label="Name"
        icon="person-outline"
        value={form.values.name}
        onChangeText={(t) => form.setValue('name', t)}
        onBlur={() => form.setFieldTouched('name')}
        error={form.errorOf('name')}
        autoCapitalize="words"
        placeholder="Your name"
      />
      <CustomTextField
        label="Email"
        icon="mail-outline"
        value={form.values.email}
        onChangeText={(t) => form.setValue('email', t)}
        onBlur={() => form.setFieldTouched('email')}
        error={form.errorOf('email')}
        keyboardType="email-address"
        placeholder="you@example.com"
      />
      <CustomTextField
        label="Password"
        icon="lock-closed-outline"
        secure
        value={form.values.password}
        onChangeText={(t) => {
          password.current = t;
          form.setValue('password', t);
        }}
        onBlur={() => form.setFieldTouched('password')}
        error={form.errorOf('password')}
        placeholder="Letters and numbers, 8+ characters"
      />
      <CustomTextField
        label="Confirm password"
        icon="lock-closed-outline"
        secure
        value={form.values.confirm}
        onChangeText={(t) => form.setValue('confirm', t)}
        onBlur={() => form.setFieldTouched('confirm')}
        error={form.errorOf('confirm')}
        placeholder="Repeat your password"
      />

      {serverError && <Text style={styles.serverError}>{serverError}</Text>}

      <LoadingButton label="Sign up" onPress={submit} loading={loading} disabled={!configured} />
      <LoadingButton label="I already have an account" variant="secondary" onPress={onGoLogin} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: theme.colors.text, textAlign: 'center' },
  serverError: { color: theme.colors.error, textAlign: 'center' },
});
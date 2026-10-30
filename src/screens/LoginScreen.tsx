import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppLogo } from '../components/AppLogo';
import { AuthLayout } from '../components/AuthLayout';
import { CustomTextField } from '../components/CustomTextField';
import { LoadingButton } from '../components/LoadingButton';
import { useForm } from '../hooks/useForm';
import { AuthUser, login } from '../services/mockAuth';
import { theme } from '../theme';
import { validateEmail, validateRequired } from '../utils/validators';

interface Props {
  onLoggedIn: (user: AuthUser) => void;
  onGoRegister: () => void;
}

export function LoginScreen({ onLoggedIn, onGoRegister }: Props) {
  const form = useForm(
    { email: '', password: '' },
    { email: validateEmail, password: validateRequired('Password') },
  );
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const submit = form.handleSubmit(async (v) => {
    setLoading(true);
    setServerError(null);
    try {
      onLoggedIn(await login(v.email.trim(), v.password));
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthLayout>
      <AppLogo />
      <Text style={styles.title}>Welcome back</Text>

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
        onChangeText={(t) => form.setValue('password', t)}
        onBlur={() => form.setFieldTouched('password')}
        error={form.errorOf('password')}
        placeholder="Your password"
      />

      {serverError && <Text style={styles.serverError}>{serverError}</Text>}

      <LoadingButton label="Log in" onPress={submit} loading={loading} />
      <LoadingButton label="Create an account" variant="secondary" onPress={onGoRegister} />

      <View>
        <Text style={styles.hint}>Demo: password "wrong123" simulates a login error.</Text>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: theme.colors.text, textAlign: 'center' },
  serverError: { color: theme.colors.error, textAlign: 'center' },
  hint: { color: theme.colors.muted, fontSize: 12, textAlign: 'center' },
});
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email.trim() || !password) return;
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Sign up failed', error.message);
    } else {
      Alert.alert(
        'Check your email',
        'We sent a confirmation link to ' + email.trim() + '. Click it to activate your account.',
        [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
      );
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.wordmark}>TISSU</Text>

          <Text style={styles.title}>Create an account.</Text>
          <Text style={styles.subtitle}>Start making informed choices about what you wear.</Text>

          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={Colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password (8+ characters)"
            placeholderTextColor={Colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.cta, loading && { opacity: 0.6 }]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.ctaText}>{loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}</Text>
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/auth/login')}>
              <Text style={styles.switchLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
  },
  wordmark: {
    fontFamily: FontFamily.serifBold,
    fontSize: 36,
    color: Colors.textPrimary,
    letterSpacing: 10,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
  },
  title: {
    fontFamily: FontFamily.serifBold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    height: 52,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    borderRadius: 2,
    marginBottom: Spacing.md,
  },
  cta: {
    backgroundColor: Colors.accent,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  ctaText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.sm,
    color: Colors.surface,
    letterSpacing: 2,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  switchText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  switchLink: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
});

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: '', email: '', password: '', password2: '',
    first_name: '', last_name: '', phone: '',
  });
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password || !form.password2) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    if (form.password !== form.password2) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
    } catch (err: any) {
      const errors = err?.response?.data;
      const msg = errors
        ? Object.values(errors).flat().join('\n')
        : 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const fields: { label: string; key: string; placeholder: string; secure?: boolean; keyboard?: any }[] = [
    { label: 'Username *', key: 'username', placeholder: 'Choose a username' },
    { label: 'Email *', key: 'email', placeholder: 'Enter your email', keyboard: 'email-address' },
    { label: 'Password *', key: 'password', placeholder: 'Create a password', secure: true },
    { label: 'Confirm Password *', key: 'password2', placeholder: 'Repeat password', secure: true },
    { label: 'First Name', key: 'first_name', placeholder: 'First name' },
    { label: 'Last Name', key: 'last_name', placeholder: 'Last name' },
    { label: 'Phone', key: 'phone', placeholder: 'Phone number', keyboard: 'phone-pad' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.emoji}>♻️</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the waste trade community</Text>
        </View>

        <View style={styles.form}>
          {fields.map((f) => (
            <View key={f.key}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                value={(form as any)[f.key]}
                onChangeText={(v) => update(f.key, v)}
                placeholder={f.placeholder}
                placeholderTextColor="#888"
                secureTextEntry={f.secure}
                keyboardType={f.keyboard || 'default'}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkHighlight}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  inner: { flexGrow: 1, padding: 24 },
  header: { alignItems: 'center', marginVertical: 32 },
  emoji: { fontSize: 52, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: '800', color: '#4ade80' },
  subtitle: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
  form: { backgroundColor: '#1e293b', borderRadius: 16, padding: 24, marginBottom: 32 },
  label: { fontSize: 13, color: '#94a3b8', marginBottom: 5, marginTop: 10 },
  input: {
    backgroundColor: '#0f172a', color: '#f1f5f9', borderRadius: 10,
    padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#334155',
  },
  button: {
    backgroundColor: '#4ade80', borderRadius: 10, padding: 16,
    alignItems: 'center', marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#0f172a', fontWeight: '700', fontSize: 16 },
  linkButton: { marginTop: 14, alignItems: 'center' },
  linkText: { color: '#94a3b8', fontSize: 14 },
  linkHighlight: { color: '#4ade80', fontWeight: '700' },
});

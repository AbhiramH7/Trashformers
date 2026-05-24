import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>👋 Welcome back,</Text>
      <Text style={styles.name}>{user?.first_name || user?.username}</Text>
      <Text style={styles.sub}>Browse waste listings, place orders, and chat with sellers.</Text>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={logout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 24, justifyContent: 'center', alignItems: 'center' },
  greeting: { fontSize: 18, color: '#94a3b8', marginBottom: 4 },
  name: { fontSize: 32, fontWeight: '800', color: '#4ade80', marginBottom: 12 },
  sub: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22 },
  logoutBtn: { marginTop: 40, backgroundColor: '#ef4444', borderRadius: 10, paddingHorizontal: 32, paddingVertical: 14 },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

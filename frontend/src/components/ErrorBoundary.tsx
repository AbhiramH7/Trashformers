import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: string; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error}</Text>
          <TouchableOpacity style={styles.btn} onPress={() => this.setState({ hasError: false, error: '' })}>
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', padding: 32 },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#f1f5f9', marginBottom: 10 },
  message: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  btn: { backgroundColor: '#4ade80', borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14 },
  btnText: { color: '#0f172a', fontWeight: '700', fontSize: 15 },
});

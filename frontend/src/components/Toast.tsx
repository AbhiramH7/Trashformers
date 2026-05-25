import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';

interface Props {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
  onHide: () => void;
}

const BG: Record<string, string> = {
  success: '#166534',
  error: '#7f1d1d',
  info: '#1e3a5f',
};

const ICON: Record<string, string> = {
  success: '✅', error: '❌', info: 'ℹ️',
};

export default function Toast({ message, type = 'info', visible, onHide }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.delay(2500),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => onHide());
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor: BG[type] }]}>
      <Text style={styles.icon}>{ICON[type]}</Text>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 90, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8,
    zIndex: 9999,
  },
  icon: { fontSize: 18 },
  text: { color: '#f1f5f9', fontSize: 14, fontWeight: '600', flex: 1 },
});

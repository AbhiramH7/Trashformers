import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

function SkeletonBox({ width, height, borderRadius = 8, style }: any) {
  const opacity = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: '#334155', opacity }, style]}
    />
  );
}

export function ListingCardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBox width="100%" height={120} borderRadius={0} />
      <View style={{ padding: 14 }}>
        <SkeletonBox width={80} height={11} style={{ marginBottom: 8 }} />
        <SkeletonBox width="85%" height={16} style={{ marginBottom: 6 }} />
        <SkeletonBox width="60%" height={12} style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <SkeletonBox width={70} height={20} />
          <SkeletonBox width={100} height={12} />
        </View>
      </View>
    </View>
  );
}

export function OrderCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <SkeletonBox width={80} height={13} />
        <SkeletonBox width={70} height={22} borderRadius={12} />
      </View>
      <SkeletonBox width="90%" height={16} style={{ marginBottom: 10 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <SkeletonBox width={70} height={12} />
        <SkeletonBox width={80} height={20} />
      </View>
    </View>
  );
}

export function ProfileSkeleton() {
  return (
    <View style={{ alignItems: 'center', padding: 32 }}>
      <SkeletonBox width={80} height={80} borderRadius={40} style={{ marginBottom: 14 }} />
      <SkeletonBox width={160} height={22} style={{ marginBottom: 8 }} />
      <SkeletonBox width={100} height={13} style={{ marginBottom: 6 }} />
      <SkeletonBox width={120} height={13} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1e293b', borderRadius: 14, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
});

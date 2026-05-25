import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { listingsAPI } from '../../api/listings';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, refreshProfile } = useAuth();
  const [myListings, setMyListings] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await listingsAPI.getMyListings();
      setMyListings(data);
    } catch {}
  };

  useFocusEffect(React.useCallback(() => { load(); refreshProfile(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([load(), refreshProfile()]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ade80" />}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>
          {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username}
        </Text>
        <Text style={styles.username}>@{user?.username}</Text>
        <Text style={styles.rating}>⭐ {user?.rating} avg rating</Text>
        <View style={styles.badges}>
          {user?.is_buyer && <View style={styles.badge}><Text style={styles.badgeText}>Buyer</Text></View>}
          {user?.is_seller && <View style={[styles.badge, styles.badgeSeller]}><Text style={styles.badgeText}>Seller</Text></View>}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{myListings.length}</Text>
          <Text style={styles.statLabel}>Listings</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{myListings.filter(l => l.status === 'sold').length}</Text>
          <Text style={styles.statLabel}>Sold</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{user?.rating || '0.0'}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>My Listings</Text>
      {myListings.length === 0
        ? <Text style={styles.empty}>No listings yet. Tap ＋ to create one!</Text>
        : myListings.slice(0, 5).map(item => (
            <TouchableOpacity key={item.id} style={styles.listingRow} onPress={() => navigation.navigate('ListingsTab', { screen: 'ListingDetail', params: { id: item.id } })}>
              <View style={styles.listingInfo}>
                <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.listingMeta}>{item.quantity} {item.unit} · ₹{item.price_per_unit}/{item.unit}</Text>
              </View>
              <View style={[styles.statusBadge, item.status === 'active' ? styles.statusActive : styles.statusInactive]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </TouchableOpacity>
          ))
      }

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('ListingsTab', { screen: 'CreateListing' })}>
          <Text style={styles.actionBtnText}>＋ Create Listing</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4ade80', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#0f172a' },
  name: { fontSize: 22, fontWeight: '800', color: '#f1f5f9' },
  username: { fontSize: 13, color: '#64748b', marginTop: 2 },
  rating: { fontSize: 14, color: '#94a3b8', marginTop: 6 },
  badges: { flexDirection: 'row', gap: 8, marginTop: 10 },
  badge: { backgroundColor: '#1e3a5f', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeSeller: { backgroundColor: '#14532d' },
  badgeText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', backgroundColor: '#1e293b', marginHorizontal: 16, borderRadius: 14, padding: 16, justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '800', color: '#4ade80' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94a3b8', marginHorizontal: 16, marginTop: 24, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  empty: { color: '#475569', fontSize: 13, marginHorizontal: 16, fontStyle: 'italic' },
  listingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e293b', marginHorizontal: 16, borderRadius: 10, padding: 14, marginBottom: 8 },
  listingInfo: { flex: 1, marginRight: 10 },
  listingTitle: { fontSize: 14, fontWeight: '600', color: '#f1f5f9' },
  listingMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusActive: { backgroundColor: '#14532d' },
  statusInactive: { backgroundColor: '#1e293b' },
  statusText: { color: '#4ade80', fontSize: 11, fontWeight: '700' },
  actions: { padding: 16, gap: 10, marginTop: 8 },
  actionBtn: { backgroundColor: '#4ade80', borderRadius: 12, padding: 16, alignItems: 'center' },
  actionBtnText: { color: '#0f172a', fontWeight: '700', fontSize: 15 },
  logoutBtn: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  logoutBtnText: { color: '#ef4444', fontWeight: '700', fontSize: 15 },
});

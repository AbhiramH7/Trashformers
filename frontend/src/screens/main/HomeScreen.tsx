import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { listingsAPI } from '../../api/listings';
import { ordersAPI } from '../../api/orders';
import { chatAPI } from '../../api/chat';
import { useFocusEffect } from '@react-navigation/native';

interface Stats {
  activeListings: number;
  totalOrders: number;
  pendingOrders: number;
  unreadMessages: number;
}

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ activeListings: 0, totalOrders: 0, pendingOrders: 0, unreadMessages: 0 });
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [myListings, allOrders, unread] = await Promise.allSettled([
        listingsAPI.getMyListings(),
        ordersAPI.getAll(),
        chatAPI.getUnreadCount(),
      ]);

      const listings = myListings.status === 'fulfilled' ? (myListings.value.data || []) : [];
      const orders = allOrders.status === 'fulfilled' ? (allOrders.value.data?.results || []) : [];
      const unreadCount = unread.status === 'fulfilled' ? (unread.value.data?.unread_count || 0) : 0;

      setStats({
        activeListings: listings.filter((l: any) => l.status === 'active').length,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
        unreadMessages: unreadCount,
      });

      // Fetch 3 latest public listings for "Discover" section
      const { data } = await listingsAPI.getAll({ page_size: 3, sort: 'newest' });
      setRecentListings(data.results || []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(React.useCallback(() => { load(); }, []));
  const onRefresh = () => { setRefreshing(true); load(); };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ade80" />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.name}>{user?.first_name || user?.username} 👋</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('ChatTab')}>
          <Text style={styles.notifEmoji}>💬</Text>
          {stats.unreadMessages > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{stats.unreadMessages}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats grid */}
      {loading
        ? <ActivityIndicator color="#4ade80" style={{ marginTop: 24 }} />
        : <View style={styles.statsGrid}>
            {[
              { label: 'Active\nListings', value: stats.activeListings, emoji: '♻️', tab: 'ListingsTab' },
              { label: 'Total\nOrders', value: stats.totalOrders, emoji: '📦', tab: 'OrdersTab' },
              { label: 'Pending\nOrders', value: stats.pendingOrders, emoji: '⏳', tab: 'OrdersTab' },
              { label: 'Unread\nMessages', value: stats.unreadMessages, emoji: '💬', tab: 'ChatTab' },
            ].map((s) => (
              <TouchableOpacity key={s.label} style={styles.statCard} onPress={() => navigation.navigate(s.tab)}>
                <Text style={styles.statEmoji}>{s.emoji}</Text>
                <Text style={styles.statNum}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
      }

      {/* Quick actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('ListingsTab', { screen: 'CreateListing' })}>
            <Text style={styles.actionEmoji}>➕</Text>
            <Text style={styles.actionText}>Create{'\n'}Listing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('ListingsTab')}>
            <Text style={styles.actionEmoji}>🔍</Text>
            <Text style={styles.actionText}>Browse{'\n'}Listings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('OrdersTab')}>
            <Text style={styles.actionEmoji}>📋</Text>
            <Text style={styles.actionText}>My{'\n'}Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('ProfileTab')}>
            <Text style={styles.actionEmoji}>👤</Text>
            <Text style={styles.actionText}>My{'\n'}Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent listings */}
      {recentListings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Listings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ListingsTab')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          {recentListings.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.listingRow}
              onPress={() => navigation.navigate('ListingsTab', { screen: 'ListingDetail', params: { id: item.id } })}
            >
              <View style={styles.listingEmoji}>
                <Text style={{ fontSize: 22 }}>♻️</Text>
              </View>
              <View style={styles.listingInfo}>
                <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.listingMeta}>by {item.seller?.username} · {item.category?.name}</Text>
              </View>
              <Text style={styles.listingPrice}>₹{item.price_per_unit}/{item.unit}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Eco tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipEmoji}>🌱</Text>
        <View style={styles.tipText}>
          <Text style={styles.tipTitle}>Eco Tip</Text>
          <Text style={styles.tipBody}>Every kg of plastic recycled saves 1.5 kg of CO₂ emissions. Keep trading!</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, paddingTop: 24 },
  greeting: { fontSize: 14, color: '#64748b' },
  name: { fontSize: 24, fontWeight: '800', color: '#f1f5f9', marginTop: 2 },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
  notifEmoji: { fontSize: 20 },
  notifBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#ef4444', borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3 },
  notifBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, marginBottom: 8 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#1e293b', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  statEmoji: { fontSize: 24, marginBottom: 6 },
  statNum: { fontSize: 28, fontWeight: '800', color: '#4ade80' },
  statLabel: { fontSize: 11, color: '#64748b', textAlign: 'center', marginTop: 4, lineHeight: 15 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  seeAll: { fontSize: 13, color: '#4ade80', fontWeight: '600' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  actionCard: { flex: 1, backgroundColor: '#1e293b', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  actionEmoji: { fontSize: 24, marginBottom: 6 },
  actionText: { fontSize: 11, color: '#94a3b8', textAlign: 'center', lineHeight: 15 },
  listingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, padding: 12, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: '#334155' },
  listingEmoji: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  listingInfo: { flex: 1 },
  listingTitle: { fontSize: 14, fontWeight: '600', color: '#f1f5f9' },
  listingMeta: { fontSize: 11, color: '#64748b', marginTop: 2 },
  listingPrice: { fontSize: 14, fontWeight: '700', color: '#4ade80' },
  tipCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#14532d', marginHorizontal: 16, marginTop: 20, marginBottom: 32, borderRadius: 14, padding: 16, gap: 12 },
  tipEmoji: { fontSize: 28 },
  tipText: { flex: 1 },
  tipTitle: { fontSize: 13, fontWeight: '700', color: '#4ade80', marginBottom: 4 },
  tipBody: { fontSize: 12, color: '#86efac', lineHeight: 18 },
});

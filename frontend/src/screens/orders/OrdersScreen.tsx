import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { ordersAPI } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const STATUS_COLOR: Record<string, string> = {
  pending: '#f59e0b',
  accepted: '#3b82f6',
  completed: '#4ade80',
  cancelled: '#ef4444',
  rejected: '#6b7280',
};

const ROLES = [
  { label: 'All', value: '' },
  { label: 'As Buyer', value: 'buyer' },
  { label: 'As Seller', value: 'seller' },
];

const STATUSES = ['', 'pending', 'accepted', 'completed', 'cancelled', 'rejected'];

export default function OrdersScreen({ navigation }: any) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [role, setRole] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    try {
      const params: any = {};
      if (role) params.role = role;
      if (statusFilter) params.status = statusFilter;
      const { data } = await ordersAPI.getAll(params);
      setOrders(data.results);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(React.useCallback(() => { load(); }, [role, statusFilter]));
  const onRefresh = () => { setRefreshing(true); load(); };

  const renderItem = ({ item }: any) => {
    const isbuyer = item.buyer?.id === user?.id;
    const other = isbuyer ? item.seller : item.buyer;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.listingTitle} numberOfLines={1}>
          {item.listing?.title || 'Listing deleted'}
        </Text>

        <View style={styles.cardRow}>
          <Text style={styles.role}>{isbuyer ? '🛒 Buyer' : '📦 Seller'}</Text>
          <Text style={styles.otherUser}>
            {isbuyer ? `Seller: ${other?.username}` : `Buyer: ${other?.username}`}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.qty}>
            {item.quantity_ordered} {item.listing?.unit || 'units'}
          </Text>
          <Text style={styles.price}>₹{item.total_price}</Text>
        </View>

        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Role filter */}
      <View style={styles.filterRow}>
        {ROLES.map(r => (
          <TouchableOpacity
            key={r.value}
            style={[styles.chip, role === r.value && styles.chipActive]}
            onPress={() => setRole(r.value)}
          >
            <Text style={[styles.chipText, role === r.value && styles.chipTextActive]}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status filter */}
      <FlatList
        data={STATUSES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={s => s || 'all'}
        style={styles.statusRow}
        renderItem={({ item: s }) => (
          <TouchableOpacity
            style={[styles.statusChip, statusFilter === s && styles.statusChipActive, s && { borderColor: STATUS_COLOR[s] + '66' }]}
            onPress={() => setStatusFilter(s)}
          >
            <Text style={[styles.statusChipText, statusFilter === s && s && { color: STATUS_COLOR[s] }]}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading
        ? <ActivityIndicator color="#4ade80" size="large" style={{ marginTop: 40 }} />
        : <FlatList
            data={orders}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 12 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ade80" />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>📦</Text>
                <Text style={styles.emptyText}>No orders yet</Text>
                <Text style={styles.emptyHint}>Browse listings and place an order!</Text>
              </View>
            }
          />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  filterRow: { flexDirection: 'row', padding: 12, paddingBottom: 4, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  chipActive: { backgroundColor: '#4ade80', borderColor: '#4ade80' },
  chipText: { color: '#94a3b8', fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#0f172a', fontWeight: '700' },
  statusRow: { paddingHorizontal: 12, marginBottom: 4 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, backgroundColor: '#1e293b', marginRight: 6, borderWidth: 1, borderColor: '#334155' },
  statusChipActive: { borderWidth: 1.5 },
  statusChipText: { color: '#64748b', fontSize: 12 },
  card: { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  listingTitle: { fontSize: 16, fontWeight: '700', color: '#f1f5f9', marginBottom: 8 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  role: { fontSize: 12, color: '#94a3b8' },
  otherUser: { fontSize: 12, color: '#64748b' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qty: { fontSize: 14, color: '#94a3b8' },
  price: { fontSize: 20, fontWeight: '800', color: '#4ade80' },
  date: { fontSize: 11, color: '#475569', marginTop: 8 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyText: { color: '#94a3b8', fontSize: 17, fontWeight: '700' },
  emptyHint: { color: '#475569', fontSize: 13, marginTop: 6 },
});

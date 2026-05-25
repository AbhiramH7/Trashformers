import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { ordersAPI } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLOR: Record<string, string> = {
  pending: '#f59e0b', accepted: '#3b82f6',
  completed: '#4ade80', cancelled: '#ef4444', rejected: '#6b7280',
};

const STATUS_EMOJI: Record<string, string> = {
  pending: '⏳', accepted: '✅', completed: '🎉', cancelled: '❌', rejected: '🚫',
};

export default function OrderDetailScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    try {
      const { data } = await ordersAPI.getById(orderId);
      setOrder(data);
    } catch { Alert.alert('Error', 'Failed to load order.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [orderId]);

  const handleStatusUpdate = (newStatus: string) => {
    const labels: Record<string, string> = {
      accepted: 'Accept', rejected: 'Reject', completed: 'Mark as Completed', cancelled: 'Cancel',
    };
    Alert.alert(
      `${labels[newStatus]} Order`,
      `Are you sure you want to ${labels[newStatus]?.toLowerCase()} this order?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: newStatus === 'rejected' || newStatus === 'cancelled' ? 'destructive' : 'default',
          onPress: async () => {
            setUpdating(true);
            try {
              await ordersAPI.updateStatus(orderId, newStatus);
              await load();
            } catch (err: any) {
              const msg = err?.response?.data?.error || 'Failed to update order.';
              Alert.alert('Error', msg);
            } finally { setUpdating(false); }
          },
        },
      ],
    );
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator color="#4ade80" size="large" /></View>;
  if (!order) return null;

  const isSeller = user?.id === order.seller?.id;
  const isBuyer = user?.id === order.buyer?.id;
  const allowed = order.allowed_transitions || [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Status banner */}
      <View style={[styles.statusBanner, { borderColor: STATUS_COLOR[order.status] }]}>
        <Text style={styles.statusEmoji}>{STATUS_EMOJI[order.status]}</Text>
        <View>
          <Text style={styles.statusLabel}>Order #{order.id}</Text>
          <Text style={[styles.statusValue, { color: STATUS_COLOR[order.status] }]}>
            {order.status_display}
          </Text>
        </View>
      </View>

      {/* Listing summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Listing</Text>
        <TouchableOpacity
          style={styles.infoCard}
          onPress={() => navigation.navigate('ListingDetail', { id: order.listing?.id })}
        >
          <Text style={styles.infoCardTitle}>{order.listing?.title || 'Listing deleted'}</Text>
          <Text style={styles.infoCardSub}>{order.listing?.category?.name?.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {/* Price breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Breakdown</Text>
        <View style={styles.infoCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Quantity</Text>
            <Text style={styles.priceValue}>{order.quantity_ordered} {order.listing?.unit}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Rate</Text>
            <Text style={styles.priceValue}>₹{order.listing?.price_per_unit}/{order.listing?.unit}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{order.total_price}</Text>
          </View>
        </View>
      </View>

      {/* Parties */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parties</Text>
        <View style={styles.infoCard}>
          <View style={styles.partyRow}>
            <Text style={styles.partyRole}>🛒 Buyer</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PublicProfile', { userId: order.buyer?.id })}>
              <Text style={styles.partyName}>{order.buyer?.username}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.partyRow}>
            <Text style={styles.partyRole}>📦 Seller</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PublicProfile', { userId: order.seller?.id })}>
              <Text style={styles.partyName}>{order.seller?.username}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Pickup details */}
      {order.pickup_address ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Details</Text>
          <View style={styles.infoCard}>
            <Text style={styles.pickupText}>📍 {order.pickup_address}</Text>
            {order.pickup_date && <Text style={styles.pickupText}>📅 {order.pickup_date}</Text>}
            {order.pickup_notes && <Text style={styles.pickupText}>📝 {order.pickup_notes}</Text>}
          </View>
        </View>
      ) : null}

      {/* Action buttons */}
      {allowed.length > 0 && !updating && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionsGrid}>
            {isSeller && allowed.includes('accepted') && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#166534' }]} onPress={() => handleStatusUpdate('accepted')}>
                <Text style={styles.actionBtnText}>✅ Accept</Text>
              </TouchableOpacity>
            )}
            {isSeller && allowed.includes('rejected') && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#7f1d1d' }]} onPress={() => handleStatusUpdate('rejected')}>
                <Text style={styles.actionBtnText}>🚫 Reject</Text>
              </TouchableOpacity>
            )}
            {isSeller && allowed.includes('completed') && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#4ade80' }]} onPress={() => handleStatusUpdate('completed')}>
                <Text style={[styles.actionBtnText, { color: '#0f172a' }]}>🎉 Complete</Text>
              </TouchableOpacity>
            )}
            {allowed.includes('cancelled') && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#ef4444' }]} onPress={() => handleStatusUpdate('cancelled')}>
                <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>❌ Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      {updating && <ActivityIndicator color="#4ade80" style={{ marginVertical: 20 }} />}

      {/* Chat button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() => navigation.navigate('ChatTab', {
            screen: 'ChatThread',
            params: {
              recipientId: isBuyer ? order.seller?.id : order.buyer?.id,
              recipientName: isBuyer ? order.seller?.username : order.buyer?.username,
              listingId: order.listing?.id,
            },
          })}
        >
          <Text style={styles.chatBtnText}>💬 Chat with {isBuyer ? 'Seller' : 'Buyer'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.dates}>
        Created {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  statusBanner: { flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: '#1e293b', borderRadius: 14, padding: 16, gap: 14, borderWidth: 1.5 },
  statusEmoji: { fontSize: 36 },
  statusLabel: { fontSize: 13, color: '#64748b', marginBottom: 2 },
  statusValue: { fontSize: 18, fontWeight: '800' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  infoCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#334155' },
  infoCardTitle: { fontSize: 15, fontWeight: '700', color: '#f1f5f9' },
  infoCardSub: { fontSize: 11, color: '#4ade80', fontWeight: '600', marginTop: 4, letterSpacing: 0.5 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  priceLabel: { color: '#94a3b8', fontSize: 14 },
  priceValue: { color: '#f1f5f9', fontSize: 14, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#334155', marginTop: 4, paddingTop: 10 },
  totalLabel: { color: '#f1f5f9', fontSize: 15, fontWeight: '700' },
  totalValue: { color: '#4ade80', fontSize: 22, fontWeight: '800' },
  partyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  partyRole: { color: '#94a3b8', fontSize: 13 },
  partyName: { color: '#4ade80', fontSize: 13, fontWeight: '700' },
  pickupText: { color: '#94a3b8', fontSize: 13, marginBottom: 4 },
  actionsGrid: { gap: 10 },
  actionBtn: { borderRadius: 12, padding: 14, alignItems: 'center' },
  actionBtnText: { color: '#f1f5f9', fontWeight: '700', fontSize: 15 },
  chatBtn: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  chatBtnText: { color: '#f1f5f9', fontWeight: '700', fontSize: 15 },
  dates: { fontSize: 11, color: '#334155', textAlign: 'center', paddingBottom: 32 },
});

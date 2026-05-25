import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import ListingMap from '../../components/ListingMap';
import { listingsAPI } from '../../api/listings';
import { ordersAPI } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';

export default function ListingDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { user } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    listingsAPI.getById(id)
      .then(({ data }) => setListing(data))
      .catch(() => Alert.alert('Error', 'Failed to load listing.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleOrder = () => {
    Alert.alert(
      'Place Order',
      `Order all ${listing.quantity} ${listing.unit} for ₹${listing.total_price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setOrdering(true);
            try {
              await ordersAPI.create({ listing_id: listing.id, quantity_ordered: listing.quantity, pickup_address: listing.address || '' });
              Alert.alert('Success', 'Order placed!', [
                { text: 'View Orders', onPress: () => navigation.navigate('Orders') },
                { text: 'OK' },
              ]);
            } catch (err: any) {
              const msg = Object.values(err?.response?.data || {}).flat().join('\n') || 'Failed to place order.';
              Alert.alert('Error', msg);
            } finally { setOrdering(false); }
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    Alert.alert('Delete Listing', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          await listingsAPI.delete(listing.id);
          navigation.goBack();
      }},
    ]);
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator color="#4ade80" size="large" /></View>;
  if (!listing) return null;

  const isOwner = user?.id === listing.seller?.id;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {listing.image
        ? <Image source={{ uri: listing.image }} style={styles.image} />
        : <View style={styles.imagePlaceholder}><Text style={{ fontSize: 72 }}>♻️</Text></View>
      }
      <View style={styles.body}>
        <View style={styles.tagRow}>
          <Text style={styles.tag}>{listing.category?.name?.toUpperCase()}</Text>
          <Text style={styles.status}>{listing.status}</Text>
        </View>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>₹{listing.price_per_unit} / {listing.unit}</Text>
        <Text style={styles.totalPrice}>Total: ₹{listing.total_price} · {listing.quantity} {listing.unit}</Text>
        {listing.distance_km != null && <Text style={styles.distance}>📍 {listing.distance_km} km away</Text>}

        {listing.description ? <>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </> : null}

        <Text style={styles.sectionTitle}>Seller</Text>
        <TouchableOpacity
          style={styles.sellerCard}
          onPress={() => navigation.navigate('PublicProfile', { userId: listing.seller.id })}
        >
          <View style={styles.sellerAvatar}><Text style={{ fontSize: 22 }}>👤</Text></View>
          <View>
            <Text style={styles.sellerName}>{listing.seller.first_name || listing.seller.username}</Text>
            <Text style={styles.sellerRating}>⭐ {listing.seller.rating} rating</Text>
          </View>
        </TouchableOpacity>

        {listing.address || (listing.latitude && listing.longitude) ? (
          <>
            <Text style={styles.sectionTitle}>Pickup Location</Text>
            {listing.latitude && listing.longitude ? (
              <ListingMap
                latitude={parseFloat(listing.latitude)}
                longitude={parseFloat(listing.longitude)}
                title={listing.address || 'Pickup Location'}
                description={listing.title}
              />
            ) : (
              <Text style={styles.address}>📍 {listing.address}</Text>
            )}
          </>
        ) : null}

        <Text style={styles.postedAt}>
          Listed {new Date(listing.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>

        {isOwner
          ? <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>🗑️ Delete Listing</Text>
            </TouchableOpacity>
          : listing.status === 'active'
          ? <View style={styles.actions}>
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => navigation.navigate('Chat', { recipientId: listing.seller.id, listingId: listing.id, recipientName: listing.seller.username })}
              >
                <Text style={styles.chatBtnText}>💬 Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.orderBtn, ordering && styles.btnDisabled]} onPress={handleOrder} disabled={ordering}>
                {ordering ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.orderBtnText}>🛒 Place Order</Text>}
              </TouchableOpacity>
            </View>
          : <View style={styles.soldBanner}><Text style={styles.soldText}>This listing is no longer available</Text></View>
        }
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  image: { width: '100%', height: 250 },
  imagePlaceholder: { height: 200, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
  body: { padding: 20 },
  tagRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  tag: { color: '#4ade80', fontWeight: '700', fontSize: 12, letterSpacing: 1 },
  status: { color: '#64748b', fontSize: 12, textTransform: 'capitalize' },
  title: { fontSize: 24, fontWeight: '800', color: '#f1f5f9', marginBottom: 12 },
  price: { fontSize: 28, fontWeight: '800', color: '#4ade80' },
  totalPrice: { fontSize: 14, color: '#94a3b8', marginTop: 4, marginBottom: 8 },
  distance: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94a3b8', marginTop: 20, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  description: { fontSize: 14, color: '#cbd5e1', lineHeight: 22 },
  sellerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, padding: 14, gap: 12 },
  sellerAvatar: { width: 44, height: 44, backgroundColor: '#334155', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sellerName: { fontSize: 15, fontWeight: '700', color: '#f1f5f9' },
  sellerRating: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  address: { fontSize: 14, color: '#94a3b8' },
  postedAt: { fontSize: 12, color: '#475569', marginTop: 20, marginBottom: 24 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  chatBtn: { flex: 1, backgroundColor: '#1e293b', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  chatBtnText: { color: '#f1f5f9', fontWeight: '700', fontSize: 15 },
  orderBtn: { flex: 2, backgroundColor: '#4ade80', borderRadius: 12, padding: 16, alignItems: 'center' },
  orderBtnText: { color: '#0f172a', fontWeight: '700', fontSize: 15 },
  btnDisabled: { opacity: 0.6 },
  deleteBtn: { backgroundColor: '#7f1d1d', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  deleteBtnText: { color: '#fca5a5', fontWeight: '700', fontSize: 15 },
  soldBanner: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  soldText: { color: '#64748b', fontSize: 14 },
});

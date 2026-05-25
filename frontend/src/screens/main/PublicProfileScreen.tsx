import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { authAPI } from '../../api/auth';
import { listingsAPI } from '../../api/listings';

export default function PublicProfileScreen({ route, navigation }: any) {
  const { userId } = route.params;
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authAPI.getPublicProfile(userId),
      listingsAPI.getAll({ seller: userId }),
    ])
      .then(([profileRes, listingsRes]) => {
        setProfile(profileRes.data);
        setListings(listingsRes.data.results || []);
      })
      .catch(() => Alert.alert('Error', 'Failed to load profile.'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#4ade80" size="large" />
      </View>
    );
  }

  if (!profile) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile.first_name?.[0] || profile.username?.[0] || '?').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>
          {profile.first_name && profile.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : profile.username}
        </Text>
        <Text style={styles.username}>@{profile.username}</Text>
        <Text style={styles.rating}>⭐ {profile.rating} avg rating</Text>
        {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() =>
            navigation.navigate('Chat', {
              recipientId: profile.id,
              recipientName: profile.username,
            })
          }
        >
          <Text style={styles.chatBtnText}>💬 Send Message</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Active Listings</Text>
      {listings.length === 0 ? (
        <Text style={styles.empty}>No active listings.</Text>
      ) : (
        listings.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.listingRow}
            onPress={() => navigation.navigate('ListingDetail', { id: item.id })}
          >
            <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.listingPrice}>₹{item.price_per_unit}/{item.unit}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  header: { alignItems: 'center', padding: 28 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#4ade80', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  name: { fontSize: 20, fontWeight: '800', color: '#f1f5f9' },
  username: { fontSize: 13, color: '#64748b', marginTop: 2 },
  rating: { fontSize: 14, color: '#94a3b8', marginTop: 6 },
  bio: { fontSize: 13, color: '#94a3b8', marginTop: 8, textAlign: 'center', lineHeight: 20 },
  chatBtn: { marginTop: 16, backgroundColor: '#4ade80', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 },
  chatBtnText: { color: '#0f172a', fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94a3b8', marginHorizontal: 16, marginTop: 8, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  empty: { color: '#475569', fontSize: 13, marginHorizontal: 16, fontStyle: 'italic' },
  listingRow: { backgroundColor: '#1e293b', marginHorizontal: 16, borderRadius: 10, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listingTitle: { fontSize: 14, fontWeight: '600', color: '#f1f5f9', flex: 1, marginRight: 8 },
  listingPrice: { fontSize: 14, fontWeight: '700', color: '#4ade80' },
});

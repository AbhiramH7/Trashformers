import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Image, Alert,
} from 'react-native';
import { listingsAPI } from '../../api/listings';

const CATEGORIES = ['All', 'plastic', 'metal', 'paper', 'biodegradable', 'ewaste'];
const SORTS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price ↑', value: 'price_asc' },
  { label: 'Price ↓', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
  { label: 'Nearest', value: 'distance' },
];
const CATEGORY_EMOJI: Record<string, string> = {
  plastic: '🧴', metal: '⚙️', paper: '📄', biodegradable: '🌿', ewaste: '💻', All: '🗂️',
};

export default function ListingsScreen({ navigation }: any) {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchListings = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;
    if (reset) setLoading(true);
    try {
      const params: any = { sort, page: currentPage, page_size: 15 };
      if (category !== 'All') params.category = category;
      if (search.trim()) params.search = search.trim();
      const { data } = await listingsAPI.getAll(params);
      if (reset) { setListings(data.results); setPage(1); }
      else { setListings(prev => [...prev, ...data.results]); }
      setTotalPages(data.total_pages);
    } catch {
      Alert.alert('Error', 'Failed to load listings.');
    } finally {
      setLoading(false); setRefreshing(false); setLoadingMore(false);
    }
  }, [category, sort, search, page]);

  useEffect(() => { fetchListings(true); }, [category, sort]);
  useEffect(() => { if (page > 1) fetchListings(false); }, [page]);

  const onRefresh = () => { setRefreshing(true); fetchListings(true); };
  const loadMore = () => {
    if (!loadingMore && page < totalPages) { setLoadingMore(true); setPage(p => p + 1); }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ListingDetail', { id: item.id })}
      activeOpacity={0.85}
    >
      {item.image
        ? <Image source={{ uri: item.image }} style={styles.cardImage} />
        : <View style={styles.cardImagePlaceholder}>
            <Text style={styles.cardImageEmoji}>{CATEGORY_EMOJI[item.category?.name] || '♻️'}</Text>
          </View>
      }
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.cardCategory}>{item.category?.name?.toUpperCase()}</Text>
          {item.distance_km != null && <Text style={styles.cardDistance}>📍 {item.distance_km} km</Text>}
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardSeller}>by {item.seller?.username} ⭐ {item.seller?.rating}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>₹{item.price_per_unit}/{item.unit}</Text>
          <Text style={styles.cardQty}>{item.quantity} {item.unit} available</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search listings..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => fetchListings(true)}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={() => fetchListings(true)}>
          <Text style={styles.searchBtnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={CATEGORIES} horizontal showsHorizontalScrollIndicator={false}
        keyExtractor={c => c} style={styles.categoryList}
        renderItem={({ item: c }) => (
          <TouchableOpacity
            style={[styles.chip, category === c && styles.chipActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.chipText, category === c && styles.chipTextActive]}>
              {CATEGORY_EMOJI[c]} {c === 'All' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={SORTS} horizontal showsHorizontalScrollIndicator={false}
        keyExtractor={s => s.value} style={styles.sortList}
        renderItem={({ item: s }) => (
          <TouchableOpacity
            style={[styles.sortChip, sort === s.value && styles.sortChipActive]}
            onPress={() => setSort(s.value)}
          >
            <Text style={[styles.sortText, sort === s.value && styles.sortTextActive]}>{s.label}</Text>
          </TouchableOpacity>
        )}
      />

      {loading
        ? <ActivityIndicator color="#4ade80" size="large" style={{ marginTop: 40 }} />
        : <FlatList
            data={listings}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 12 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ade80" />}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🗑️</Text>
                <Text style={styles.emptyText}>No listings found</Text>
              </View>
            }
            ListFooterComponent={loadingMore ? <ActivityIndicator color="#4ade80" style={{ padding: 16 }} /> : null}
          />
      }

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateListing')}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  searchRow: { flexDirection: 'row', padding: 12, paddingBottom: 4, gap: 8 },
  searchInput: { flex: 1, backgroundColor: '#1e293b', color: '#f1f5f9', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, borderWidth: 1, borderColor: '#334155' },
  searchBtn: { backgroundColor: '#1e293b', borderRadius: 10, padding: 10, justifyContent: 'center' },
  searchBtnText: { fontSize: 18 },
  categoryList: { paddingHorizontal: 12, paddingVertical: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#1e293b', marginRight: 8, borderWidth: 1, borderColor: '#334155' },
  chipActive: { backgroundColor: '#4ade80', borderColor: '#4ade80' },
  chipText: { color: '#94a3b8', fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#0f172a', fontWeight: '700' },
  sortList: { paddingHorizontal: 12, marginBottom: 4 },
  sortChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, backgroundColor: '#1e293b', marginRight: 6, borderWidth: 1, borderColor: '#334155' },
  sortChipActive: { borderColor: '#4ade80' },
  sortText: { color: '#64748b', fontSize: 12 },
  sortTextActive: { color: '#4ade80', fontWeight: '600' },
  card: { backgroundColor: '#1e293b', borderRadius: 14, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
  cardImage: { width: '100%', height: 150 },
  cardImagePlaceholder: { width: '100%', height: 120, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  cardImageEmoji: { fontSize: 48 },
  cardBody: { padding: 14 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardCategory: { fontSize: 11, color: '#4ade80', fontWeight: '700', letterSpacing: 0.8 },
  cardDistance: { fontSize: 11, color: '#64748b' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#f1f5f9', marginBottom: 2 },
  cardSeller: { fontSize: 12, color: '#64748b', marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: 18, fontWeight: '800', color: '#4ade80' },
  cardQty: { fontSize: 12, color: '#94a3b8' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#64748b', fontSize: 15 },
  fab: { position: 'absolute', bottom: 24, right: 20, backgroundColor: '#4ade80', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#4ade80', shadowOpacity: 0.4, shadowRadius: 8 },
  fabText: { fontSize: 28, color: '#0f172a', fontWeight: '700', lineHeight: 32 },
});

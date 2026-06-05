import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { listingsAPI } from '../../api/listings';

const UNITS = ['kg', 'ton', 'piece', 'litre'];

type LocationMode = 'gps' | 'manual';

export default function CreateListingScreen({ navigation }: any) {
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    category: '', title: '', description: '',
    quantity: '', unit: 'kg', price_per_unit: '',
    address: '',        // typed address for geocoding
  });
  const [locationMode, setLocationMode] = useState<LocationMode>('gps');
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'fetching' | 'got' | 'denied'>('idle');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listingsAPI.getCategories()
      .then(({ data }) => {
        setCategories(data);
        if (data.length > 0) setForm(f => ({ ...f, category: data[0].id.toString() }));
      })
      .catch(() => {});

    // Auto-fetch GPS on load
    fetchGPS();
  }, []);

  const fetchGPS = async () => {
    setGpsStatus('fetching');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setGpsStatus('denied'); return; }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setGpsCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      setGpsStatus('got');
    } catch {
      setGpsStatus('denied');
    }
  };

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.category || !form.quantity || !form.price_per_unit) {
      Alert.alert('Error', 'Title, category, quantity and price are required.');
      return;
    }
    // Need at least address or GPS coords
    if (locationMode === 'manual' && !form.address.trim()) {
      Alert.alert('Error', 'Please enter a pickup address so buyers can find you.');
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('title', form.title.trim());
      payload.append('category', form.category);
      payload.append('description', form.description.trim());
      payload.append('quantity', form.quantity);
      payload.append('unit', form.unit);
      payload.append('price_per_unit', form.price_per_unit);

      if (locationMode === 'gps' && gpsCoords) {
        // Send exact GPS coords — backend will use these directly
        payload.append('latitude', gpsCoords.latitude.toString());
        payload.append('longitude', gpsCoords.longitude.toString());
      } else if (locationMode === 'manual' && form.address.trim()) {
        // Send address — backend will geocode it via Nominatim
        payload.append('address', form.address.trim());
      }

      await listingsAPI.create(payload);
      Alert.alert('Success', 'Listing created!', [
        { text: 'View Listings', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data
        ? Object.values(err.response.data).flat().join('\n')
        : 'Failed to create listing.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.pageTitle}>♻️ New Listing</Text>

      {/* Category */}
      <Text style={styles.label}>Category *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catChip, form.category === cat.id.toString() && styles.catChipActive]}
            onPress={() => update('category', cat.id.toString())}
          >
            <Text style={[styles.catChipText, form.category === cat.id.toString() && styles.catChipTextActive]}>
              {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Title */}
      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        value={form.title}
        onChangeText={v => update('title', v)}
        placeholder="e.g. Plastic PET Bottles"
        placeholderTextColor="#475569"
      />

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={form.description}
        onChangeText={v => update('description', v)}
        placeholder="Describe condition, batch size, packaging..."
        placeholderTextColor="#475569"
        multiline
        numberOfLines={3}
      />

      {/* Quantity + Unit */}
      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.label}>Quantity *</Text>
          <TextInput
            style={styles.input}
            value={form.quantity}
            onChangeText={v => update('quantity', v)}
            placeholder="50"
            placeholderTextColor="#475569"
            keyboardType="decimal-pad"
          />
        </View>
        <View style={[styles.flex1, { marginLeft: 10 }]}>
          <Text style={styles.label}>Unit *</Text>
          <View style={styles.unitRow}>
            {UNITS.map(u => (
              <TouchableOpacity
                key={u}
                style={[styles.unitChip, form.unit === u && styles.unitChipActive]}
                onPress={() => update('unit', u)}
              >
                <Text style={[styles.unitText, form.unit === u && styles.unitTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Price */}
      <Text style={styles.label}>Price per Unit (₹) *</Text>
      <TextInput
        style={styles.input}
        value={form.price_per_unit}
        onChangeText={v => update('price_per_unit', v)}
        placeholder="25.00"
        placeholderTextColor="#475569"
        keyboardType="decimal-pad"
      />

      {/* ── Pickup Location Section ── */}
      <Text style={styles.sectionLabel}>📍 Pickup Location *</Text>
      <Text style={styles.sectionHint}>
        Buyers will see this on the map. Choose how to set your location:
      </Text>

      {/* Toggle: GPS vs Manual address */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, locationMode === 'gps' && styles.toggleBtnActive]}
          onPress={() => setLocationMode('gps')}
        >
          <Text style={[styles.toggleText, locationMode === 'gps' && styles.toggleTextActive]}>
            📡 Use My GPS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, locationMode === 'manual' && styles.toggleBtnActive]}
          onPress={() => setLocationMode('manual')}
        >
          <Text style={[styles.toggleText, locationMode === 'manual' && styles.toggleTextActive]}>
            ✏️ Type Address
          </Text>
        </TouchableOpacity>
      </View>

      {/* GPS mode */}
      {locationMode === 'gps' && (
        <View style={styles.locationCard}>
          {gpsStatus === 'fetching' && (
            <View style={styles.locationRow}>
              <ActivityIndicator color="#4ade80" size="small" />
              <Text style={styles.locationText}>  Getting your GPS location…</Text>
            </View>
          )}
          {gpsStatus === 'got' && gpsCoords && (
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>✅</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationText}>Current GPS location captured</Text>
                <Text style={styles.locationCoords}>
                  {gpsCoords.latitude.toFixed(5)}, {gpsCoords.longitude.toFixed(5)}
                </Text>
              </View>
              <TouchableOpacity onPress={fetchGPS} style={styles.retryBtn}>
                <Text style={styles.retryText}>↻ Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
          {gpsStatus === 'denied' && (
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.locationText, { color: '#f59e0b' }]}>
                  Location permission denied
                </Text>
                <Text style={styles.locationCoords}>
                  Switch to "Type Address" or grant permission in Settings
                </Text>
              </View>
              <TouchableOpacity onPress={fetchGPS} style={styles.retryBtn}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Manual address mode */}
      {locationMode === 'manual' && (
        <View>
          <TextInput
            style={[styles.input, styles.addressInput]}
            value={form.address}
            onChangeText={v => update('address', v)}
            placeholder="e.g. 42 MG Road, Bengaluru, Karnataka"
            placeholderTextColor="#475569"
            multiline
            numberOfLines={2}
          />
          <Text style={styles.addressHint}>
            💡 The address will be automatically geocoded to show on the map for buyers.
          </Text>
        </View>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#0f172a" />
          : <Text style={styles.submitBtnText}>✓ Create Listing</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  inner: { padding: 20, paddingBottom: 48 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#4ade80', marginBottom: 20 },
  label: { fontSize: 13, color: '#94a3b8', marginTop: 14, marginBottom: 6 },
  input: {
    backgroundColor: '#1e293b', color: '#f1f5f9',
    borderRadius: 10, padding: 14, fontSize: 14,
    borderWidth: 1, borderColor: '#334155',
  },
  textarea: { height: 90, textAlignVertical: 'top' },
  addressInput: { height: 70, textAlignVertical: 'top', marginBottom: 6 },
  categoryRow: { marginBottom: 4 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#1e293b', marginRight: 8, borderWidth: 1, borderColor: '#334155',
  },
  catChipActive: { backgroundColor: '#4ade80', borderColor: '#4ade80' },
  catChipText: { color: '#94a3b8', fontSize: 13 },
  catChipTextActive: { color: '#0f172a', fontWeight: '700' },
  row: { flexDirection: 'row', marginTop: 4 },
  flex1: { flex: 1 },
  unitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  unitChip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155',
  },
  unitChipActive: { borderColor: '#4ade80' },
  unitText: { color: '#64748b', fontSize: 12 },
  unitTextActive: { color: '#4ade80', fontWeight: '600' },
  // Location section
  sectionLabel: {
    fontSize: 15, fontWeight: '700', color: '#f1f5f9', marginTop: 24, marginBottom: 4,
  },
  sectionHint: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  toggleRow: {
    flexDirection: 'row', gap: 10, marginBottom: 12,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: '#1e293b', alignItems: 'center',
    borderWidth: 1, borderColor: '#334155',
  },
  toggleBtnActive: { borderColor: '#4ade80', backgroundColor: '#0f2a18' },
  toggleText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  toggleTextActive: { color: '#4ade80' },
  locationCard: {
    backgroundColor: '#1e293b', borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: '#334155',
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationIcon: { fontSize: 18 },
  locationText: { fontSize: 13, color: '#f1f5f9', fontWeight: '600' },
  locationCoords: { fontSize: 11, color: '#64748b', marginTop: 2 },
  retryBtn: {
    backgroundColor: '#334155', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  retryText: { color: '#4ade80', fontSize: 11, fontWeight: '700' },
  addressHint: { fontSize: 11, color: '#475569', fontStyle: 'italic', marginTop: 2 },
  submitBtn: {
    backgroundColor: '#4ade80', borderRadius: 12,
    padding: 18, alignItems: 'center', marginTop: 28,
  },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#0f172a', fontWeight: '800', fontSize: 16 },
});

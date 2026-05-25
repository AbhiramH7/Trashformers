import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { listingsAPI } from '../../api/listings';

const UNITS = ['kg', 'ton', 'piece', 'litre'];

export default function CreateListingScreen({ navigation }: any) {
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    category: '', title: '', description: '',
    quantity: '', unit: 'kg', price_per_unit: '', address: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listingsAPI.getCategories()
      .then(({ data }) => {
        setCategories(data);
        if (data.length > 0) setForm(f => ({ ...f, category: data[0].id.toString() }));
      })
      .catch(() => {});
  }, []);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.category || !form.quantity || !form.price_per_unit) {
      Alert.alert('Error', 'Title, category, quantity and price are required.');
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
      if (form.address) payload.append('address', form.address);
      await listingsAPI.create(payload);
      Alert.alert('Success', 'Listing created!', [
        { text: 'View Listings', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data ? Object.values(err.response.data).flat().join('\n') : 'Failed to create listing.';
      Alert.alert('Error', msg);
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.pageTitle}>♻️ New Listing</Text>

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

      <Text style={styles.label}>Title *</Text>
      <TextInput style={styles.input} value={form.title} onChangeText={v => update('title', v)} placeholder="e.g. Plastic PET Bottles" placeholderTextColor="#475569" />

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, styles.textarea]} value={form.description} onChangeText={v => update('description', v)} placeholder="Describe your waste..." placeholderTextColor="#475569" multiline numberOfLines={3} />

      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.label}>Quantity *</Text>
          <TextInput style={styles.input} value={form.quantity} onChangeText={v => update('quantity', v)} placeholder="50" placeholderTextColor="#475569" keyboardType="decimal-pad" />
        </View>
        <View style={[styles.flex1, { marginLeft: 10 }]}>
          <Text style={styles.label}>Unit *</Text>
          <View style={styles.unitRow}>
            {UNITS.map(u => (
              <TouchableOpacity key={u} style={[styles.unitChip, form.unit === u && styles.unitChipActive]} onPress={() => update('unit', u)}>
                <Text style={[styles.unitText, form.unit === u && styles.unitTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <Text style={styles.label}>Price per Unit (₹) *</Text>
      <TextInput style={styles.input} value={form.price_per_unit} onChangeText={v => update('price_per_unit', v)} placeholder="25.00" placeholderTextColor="#475569" keyboardType="decimal-pad" />

      <Text style={styles.label}>Pickup Address</Text>
      <TextInput style={styles.input} value={form.address} onChangeText={v => update('address', v)} placeholder="Street, City" placeholderTextColor="#475569" />

      <TouchableOpacity style={[styles.submitBtn, loading && styles.btnDisabled]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.submitBtnText}>Create Listing</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  inner: { padding: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#4ade80', marginBottom: 20 },
  label: { fontSize: 13, color: '#94a3b8', marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: '#1e293b', color: '#f1f5f9', borderRadius: 10, padding: 14, fontSize: 14, borderWidth: 1, borderColor: '#334155' },
  textarea: { height: 90, textAlignVertical: 'top' },
  categoryRow: { marginBottom: 4 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1e293b', marginRight: 8, borderWidth: 1, borderColor: '#334155' },
  catChipActive: { backgroundColor: '#4ade80', borderColor: '#4ade80' },
  catChipText: { color: '#94a3b8', fontSize: 13 },
  catChipTextActive: { color: '#0f172a', fontWeight: '700' },
  row: { flexDirection: 'row', marginTop: 4 },
  flex1: { flex: 1 },
  unitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  unitChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  unitChipActive: { borderColor: '#4ade80' },
  unitText: { color: '#64748b', fontSize: 12 },
  unitTextActive: { color: '#4ade80', fontWeight: '600' },
  submitBtn: { backgroundColor: '#4ade80', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 28 },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#0f172a', fontWeight: '800', fontSize: 16 },
});

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking, Platform,
} from 'react-native';

interface Props {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
}

export default function ListingMap({ latitude, longitude, title, description }: Props) {
  const openInMaps = () => {
    const label = encodeURIComponent(title || 'Pickup Location');
    const url = Platform.OS === 'ios'
      ? `maps:?q=${label}&ll=${latitude},${longitude}`
      : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardHeader}>
        <Text style={styles.headerEmoji}>📍</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {title || 'Pickup Location'}
          </Text>
          <Text style={styles.coordinates}>
            Latitude: {latitude.toFixed(6)} · Longitude: {longitude.toFixed(6)}
          </Text>
        </View>
      </View>
      
      {description ? (
        <Text style={styles.description} numberOfLines={1}>
          Item: {description}
        </Text>
      ) : null}

      <TouchableOpacity style={styles.openBtn} onPress={openInMaps}>
        <Text style={styles.openBtnText}>🗺️ View in Navigation Maps</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#f1f5f9',
    fontWeight: '700',
    lineHeight: 18,
  },
  coordinates: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },
  description: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 12,
    fontStyle: 'italic',
  },
  openBtn: {
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#475569',
  },
  openBtnText: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '600',
  },
});

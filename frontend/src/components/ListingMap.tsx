import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking, Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface Props {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
}

export default function ListingMap({ latitude, longitude, title, description }: Props) {
  const validCoords =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude !== 0 &&
    longitude !== 0;

  const openInMaps = () => {
    const label = encodeURIComponent(title || 'Pickup Location');
    const url =
      Platform.OS === 'ios'
        ? `maps:?q=${label}&ll=${latitude},${longitude}`
        : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      );
    });
  };

  if (!validCoords) {
    return (
      <View style={styles.noLocationCard}>
        <Text style={styles.noLocationEmoji}>📍</Text>
        <Text style={styles.noLocationText}>Location not available for this listing.</Text>
        <Text style={styles.noLocationHint}>Contact the seller for pickup details.</Text>
      </View>
    );
  }

  const region = {
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        customMapStyle={darkMapStyle}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={title || 'Pickup Location'}
          description={description}
        />
      </MapView>

      {/* Info strip at bottom */}
      <View style={styles.infoStrip}>
        <View style={styles.infoText}>
          <Text style={styles.infoTitle} numberOfLines={1}>
            📍 {title || 'Pickup Location'}
          </Text>
          <Text style={styles.infoCoords}>
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </Text>
        </View>
        <TouchableOpacity style={styles.openBtn} onPress={openInMaps} activeOpacity={0.8}>
          <Text style={styles.openBtnText}>Navigate ↗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Dark map style matching app theme
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#475569' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#14532d' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
];

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 8,
  },
  map: {
    width: '100%',
    height: 200,
  },
  infoStrip: {
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  infoCoords: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },
  openBtn: {
    backgroundColor: '#4ade80',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  openBtnText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
  },
  // No-location fallback
  noLocationCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 8,
  },
  noLocationEmoji: { fontSize: 28, marginBottom: 8 },
  noLocationText: { color: '#94a3b8', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  noLocationHint: { color: '#475569', fontSize: 12, marginTop: 4, textAlign: 'center' },
});

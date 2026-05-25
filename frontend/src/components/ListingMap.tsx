import React, { useState } from 'react';
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
  const [expanded, setExpanded] = useState(false);

  const openInMaps = () => {
    const label = encodeURIComponent(title || 'Pickup Location');
    const url = Platform.OS === 'ios'
      ? `maps:?q=${label}&ll=${latitude},${longitude}`
      : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`;
    Linking.openURL(url).catch(() => {
      // Fallback to Google Maps web
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded(e => !e)}>
        <Text style={styles.headerText}>📍 {title || 'Pickup Location'}</Text>
        <Text style={styles.toggle}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{ latitude, longitude }}
              title={title || 'Pickup Location'}
              description={description}
              pinColor="#4ade80"
            />
          </MapView>
          <TouchableOpacity style={styles.openBtn} onPress={openInMaps}>
            <Text style={styles.openBtnText}>Open in Maps →</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  headerText: { fontSize: 14, color: '#f1f5f9', fontWeight: '600' },
  toggle: { color: '#64748b', fontSize: 12 },
  map: { width: '100%', height: 180 },
  openBtn: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  openBtnText: { color: '#4ade80', fontSize: 13, fontWeight: '600' },
});

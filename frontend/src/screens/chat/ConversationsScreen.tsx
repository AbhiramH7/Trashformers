import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { chatAPI } from '../../api/chat';
import { useFocusEffect } from '@react-navigation/native';

export default function ConversationsScreen({ navigation }: any) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await chatAPI.getConversations();
      setConversations(data.results);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(React.useCallback(() => { load(); }, []));
  const onRefresh = () => { setRefreshing(true); load(); };

  const renderItem = ({ item }: any) => {
    const other = item.other_user;
    const last = item.last_message;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ChatThread', {
          conversationId: item.id,
          recipientName: other?.username || 'User',
          recipientId: other?.id,
        })}
        activeOpacity={0.85}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(other?.first_name?.[0] || other?.username?.[0] || '?').toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={styles.name}>{other?.first_name || other?.username}</Text>
            {last && <Text style={styles.time}>{new Date(last.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Text>}
          </View>
          <View style={styles.row}>
            <Text style={styles.lastMsg} numberOfLines={1}>
              {last ? last.content : 'Start the conversation...'}
            </Text>
            {item.unread_count > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unread_count}</Text>
              </View>
            )}
          </View>
          {item.listing && <Text style={styles.listing}>📦 Re: listing #{item.listing}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator color="#4ade80" size="large" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ade80" />}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptyHint}>Browse listings and tap Chat to start</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  card: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 14, padding: 14, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#4ade80', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  info: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: '#f1f5f9' },
  time: { fontSize: 11, color: '#475569' },
  lastMsg: { fontSize: 13, color: '#64748b', flex: 1, marginTop: 3 },
  listing: { fontSize: 11, color: '#4ade80', marginTop: 4 },
  badge: { backgroundColor: '#4ade80', borderRadius: 12, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#0f172a' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyText: { color: '#94a3b8', fontSize: 17, fontWeight: '700' },
  emptyHint: { color: '#475569', fontSize: 13, marginTop: 6 },
});

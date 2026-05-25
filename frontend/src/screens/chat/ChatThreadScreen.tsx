import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { chatAPI } from '../../api/chat';
import { useAuth } from '../../context/AuthContext';

export default function ChatThreadScreen({ route }: any) {
  const { conversationId, recipientId, listingId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const load = async () => {
    try {
      if (conversationId) {
        const { data } = await chatAPI.getMessages(conversationId);
        setMessages(data.results);
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [conversationId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText('');
    setSending(true);
    try {
      const { data: msg } = await chatAPI.send({
        recipient_id: recipientId,
        content,
        listing_id: listingId || undefined,
      });
      setMessages(prev => [...prev, msg]);
    } catch {} finally { setSending(false); }
  };

  const renderMsg = ({ item }: any) => {
    const isMe = item.sender?.id === user?.id;
    return (
      <View style={[styles.msgRow, isMe ? styles.msgRowRight : styles.msgRowLeft]}>
        {!isMe && (
          <View style={styles.msgAvatar}>
            <Text style={styles.msgAvatarText}>
              {(item.sender?.username?.[0] || '?').toUpperCase()}
            </Text>
          </View>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
            {item.content}
          </Text>
          <Text style={[styles.bubbleTime, isMe ? styles.bubbleTimeMe : styles.bubbleTimeThem]}>
            {new Date(item.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            {isMe && (item.is_read ? '  ✓✓' : '  ✓')}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator color="#4ade80" size="large" /></View>;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={item => item.id.toString()}
        renderItem={renderMsg}
        contentContainerStyle={{ padding: 12, paddingBottom: 8 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Say hello! 👋</Text>
          </View>
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor="#475569"
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!text.trim() || sending}
        >
          {sending
            ? <ActivityIndicator color="#0f172a" size="small" />
            : <Text style={styles.sendBtnText}>➤</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  msgRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-end' },
  msgRowLeft: { justifyContent: 'flex-start' },
  msgRowRight: { justifyContent: 'flex-end' },
  msgAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  msgAvatarText: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  bubble: { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { backgroundColor: '#4ade80', borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: '#1e293b', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#334155' },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextMe: { color: '#0f172a' },
  bubbleTextThem: { color: '#f1f5f9' },
  bubbleTime: { fontSize: 10, marginTop: 4 },
  bubbleTimeMe: { color: '#166534', textAlign: 'right' },
  bubbleTimeThem: { color: '#475569' },
  inputRow: { flexDirection: 'row', padding: 10, paddingBottom: Platform.OS === 'ios' ? 20 : 10, backgroundColor: '#1e293b', borderTopWidth: 1, borderTopColor: '#334155', alignItems: 'flex-end', gap: 8 },
  input: { flex: 1, backgroundColor: '#0f172a', color: '#f1f5f9', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100, borderWidth: 1, borderColor: '#334155' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4ade80', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { fontSize: 18, color: '#0f172a', fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#64748b', fontSize: 15 },
});

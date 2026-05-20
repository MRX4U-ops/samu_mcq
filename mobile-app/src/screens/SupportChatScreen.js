import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { ArrowLeft, Send, User, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config/Constants';
import useAuthStore from '../store/authStore';

const SupportChatScreen = ({ route, navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const { user, isAdmin } = useAuthStore();
  const { ticketId, ticketTitle } = route.params;
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef();

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/support/messages/${ticketId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Fetch messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch(`${API_URL}/support/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'user-id': user.id
        },
        body: JSON.stringify({
          ticketId,
          message: newMessage,
          isAdminReply: isAdmin()
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Send message error:', error);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => {
    const isMe = item.sender_id === user.id;
    const isReply = item.is_admin_reply;

    return (
      <View style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
        {!isMe && (
          <View style={[styles.avatar, { backgroundColor: isReply ? '#6366F1' : '#E5E7EB' }]}>
            {isReply ? <ShieldCheck size={12} color="#FFF" /> : <User size={12} color="#94A3B8" />}
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isMe ? { backgroundColor: '#6366F1' } : { backgroundColor: colors.surface },
          !isMe && isReply && { borderLeftWidth: 4, borderLeftColor: '#F59E0B' }
        ]}>
          <Text style={[styles.messageText, isMe ? { color: '#FFF' } : { color: colors.text }]}>
            {item.message}
          </Text>
          <Text style={[styles.timeText, isMe ? { color: 'rgba(255,255,255,0.7)' } : { color: colors.textSecondary }]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{ticketTitle}</Text>
          <Text style={styles.headerSub}>Ticket ID: #{ticketId.split('-')[0].toUpperCase()}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[styles.inputArea, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Type your message..."
            placeholderTextColor={colors.textSecondary}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, (!newMessage.trim() || sending) && styles.disabledSend]} 
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? <ActivityIndicator size="small" color="#FFF" /> : <Send size={20} color="#FFF" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitleBox: { marginLeft: 15, flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  headerSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  list: { padding: 20, paddingBottom: 40 },
  messageWrapper: { flexDirection: 'row', marginBottom: 15, maxWidth: '80%' },
  myMessageWrapper: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  theirMessageWrapper: { alignSelf: 'flex-start' },
  avatar: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginTop: 10 },
  messageBubble: { padding: 12, borderRadius: 20, elevation: 1 },
  messageText: { fontSize: 14, lineHeight: 20 },
  timeText: { fontSize: 9, marginTop: 4, textAlign: 'right' },
  inputArea: { flexDirection: 'row', padding: 15, alignItems: 'center', borderTopWidth: 1 },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, fontSize: 15, borderWidth: 1, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  disabledSend: { backgroundColor: '#CBD5E1' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default SupportChatScreen;

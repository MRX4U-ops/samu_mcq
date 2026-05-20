import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { ArrowLeft, LifeBuoy, Clock, CircleCheck, AlertCircle, ChevronRight, Filter, Search } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { API_URL } from '../../config/Constants';

const AdminSupport = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/support/admin/all`);
      const data = await response.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch tickets error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_URL}/support/admin/status/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: adminNotes })
      });
      
      if (response.ok) {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status, admin_notes: adminNotes } : t));
        setModalVisible(false);
        setAdminNotes('');
        Alert.alert("Success", `Ticket marked as ${status}`);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update ticket status");
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.ticketCard, { backgroundColor: colors.surface }]}
      onPress={() => {
        setSelectedTicket(item);
        setAdminNotes(item.admin_notes || '');
        setModalVisible(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '15' }]}>
          <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>{item.priority}</Text>
        </View>
        <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      
      <Text style={[styles.ticketTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.ticketCategory, { color: colors.textSecondary }]}>{item.category}</Text>
      
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>{item.profiles?.name || 'Unknown User'}</Text>
        <View style={[styles.statusTag, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getPriorityColor = (p) => {
    if (p === 'High') return '#EF4444';
    if (p === 'Medium') return '#F59E0B';
    return '#6366F1';
  };

  const getStatusColor = (s) => {
    if (s === 'RESOLVED') return '#10B981';
    if (s === 'PENDING') return '#F59E0B';
    return '#64748B';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Clinical Support Desk</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={tickets}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          onRefresh={fetchTickets}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.empty}>
              <LifeBuoy size={64} color="#E5E7EB" />
              <Text style={styles.emptyText}>No support tickets found.</Text>
            </View>
          }
        />
      )}

      {/* Ticket Action Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Resolve Ticket</Text>
            
            {selectedTicket && (
              <View style={styles.ticketDetails}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>USER COMPLAINT:</Text>
                <Text style={[styles.detailText, { color: colors.text }]}>{selectedTicket.description}</Text>
              </View>
            )}

            <Text style={[styles.detailLabel, { color: colors.textSecondary, marginTop: 15 }]}>ADMIN NOTES / RESOLUTION:</Text>
            <TextInput
              style={[styles.notesInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              multiline
              numberOfLines={4}
              placeholder="Enter resolution details..."
              placeholderTextColor={colors.textSecondary}
              value={adminNotes}
              onChangeText={setAdminNotes}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: '#6366F1' }]} 
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('SupportChat', { ticketId: selectedTicket.id, ticketTitle: selectedTicket.title });
                }}
              >
                <Text style={styles.actionBtnText}>Open Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: '#F59E0B' }]} 
                onPress={() => handleUpdateStatus(selectedTicket.id, 'PENDING')}
              >
                <Text style={styles.actionBtnText}>Pending</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: '#10B981' }]} 
                onPress={() => handleUpdateStatus(selectedTicket.id, 'RESOLVED')}
              >
                <Text style={styles.actionBtnText}>Resolved</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: colors.border }]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.actionBtnText, { color: colors.text }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
  list: { padding: 16 },
  ticketCard: { padding: 18, borderRadius: 20, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  priorityText: { fontSize: 10, fontWeight: '900' },
  dateText: { fontSize: 11, color: '#94A3B8' },
  ticketTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  ticketCategory: { fontSize: 12, fontWeight: '600', marginBottom: 12 },
  userInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  userName: { fontSize: 13, fontWeight: '600' },
  statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '800' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#94A3B8', marginTop: 15, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 25, maxHeight: '80%' },
  modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 20 },
  ticketDetails: { padding: 15, backgroundColor: '#F8FAFC', borderRadius: 16 },
  detailLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  detailText: { fontSize: 14, lineHeight: 20 },
  notesInput: { borderRadius: 16, padding: 15, fontSize: 14, borderWidth: 1, height: 120, marginTop: 10, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 25, marginBottom: 10 },
  actionBtn: { flex: 1, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { color: '#FFF', fontWeight: 'bold' }
});

export default AdminSupport;

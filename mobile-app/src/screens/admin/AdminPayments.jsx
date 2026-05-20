import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { ArrowLeft, CreditCard, Check, X, User } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabaseClient';

const AdminPayments = ({ navigation }) => {
  const { colors } = useTheme();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payment_requests')
      .select('*, profiles(name, email)')
      .order('created_at', { ascending: false });
    
    if (!error) setPayments(data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const handleAction = async (id, status) => {
    const { error } = await supabase
      .from('payment_requests')
      .update({ status })
      .eq('id', id);
    
    if (!error) {
      Alert.alert('Success', `Payment ${status}`);
      loadPayments();
    } else {
      Alert.alert('Error', error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <User size={16} color="#6366F1" />
          <Text style={[styles.userName, { color: colors.text }]}>{item.profiles?.name}</Text>
        </View>
        <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.label}>Transaction ID:</Text>
        <Text style={[styles.value, { color: colors.text }]}>{item.transaction_id}</Text>
        <Text style={styles.label}>Amount:</Text>
        <Text style={[styles.amount, { color: colors.text }]}>₹{item.amount}</Text>
      </View>

      {item.status === 'pending' ? (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#10B981' }]} 
            onPress={() => Alert.alert('Approve?', 'Confirm payment verification?', [
              { text: 'Cancel' },
              { text: 'Approve', onPress: () => handleAction(item.id, 'approved') }
            ])}
          >
            <Check size={18} color="#FFF" />
            <Text style={styles.btnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#EF4444' }]} 
            onPress={() => Alert.alert('Reject?', 'Confirm payment rejection?', [
              { text: 'Cancel' },
              { text: 'Reject', onPress: () => handleAction(item.id, 'rejected') }
            ])}
          >
            <X size={18} color="#FFF" />
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'approved' ? '#10B98115' : '#EF444415' }]}>
          <Text style={[styles.statusText, { color: item.status === 'approved' ? '#10B981' : '#EF4444' }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ArrowLeft size={24} color={colors.text} onPress={() => navigation.goBack()} />
        <Text style={[styles.title, { color: colors.text }]}>Payment Verifications</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 50 }} />
      ) : (
        <FlatList 
          data={payments}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <CreditCard size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No payment requests found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 15 },
  title: { fontSize: 22, fontWeight: '900' },
  list: { padding: 20, paddingTop: 0 },
  card: { padding: 18, borderRadius: 24, marginBottom: 15, elevation: 2, shadowOpacity: 0.05 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 15, fontWeight: '700' },
  date: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  details: { marginBottom: 15 },
  label: { fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  amount: { fontSize: 18, fontWeight: '900' },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, height: 45, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  statusBadge: { padding: 10, borderRadius: 12, alignItems: 'center' },
  statusText: { fontSize: 12, fontWeight: '900' },
  empty: { alignItems: 'center', marginTop: 100, gap: 10 },
  emptyText: { color: '#94A3B8', fontWeight: '600' }
});

export default AdminPayments;

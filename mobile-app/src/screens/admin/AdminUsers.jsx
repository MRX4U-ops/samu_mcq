import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, ActivityIndicator, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { Search, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import useAuthStore from '../../store/authStore';
import UserCard from '../../components/admin/UserCard';

const AdminUsers = ({ navigation }) => {
  const { colors } = useTheme();
  const { fetchAllUsers, updateUserStatus, deleteUser, activateSubscription } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  
  // Quick Activate State
  const [quickEmail, setQuickEmail] = useState('');
  const [quickDays, setQuickDays] = useState('90');
  const { activateSubscriptionByEmail } = useAuthStore();
  
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await fetchAllUsers();
    if (!error) {
      setUsers(data);
      setFilteredUsers(data);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const { data, error } = await fetchAllUsers();
    if (!error) {
      setUsers(data);
      handleSearch(search, data);
    }
    setRefreshing(false);
  };

  const handleSearch = (text, data = users) => {
    setSearch(text);
    const filtered = data.filter(u => 
      u.name.toLowerCase().includes(text.toLowerCase()) || 
      u.email.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleUpdate = async (type, userId, value) => {
    let error;
    if (type === 'status') {
      const res = await updateUserStatus(userId, value);
      error = res.error;
    } else if (type === 'delete') {
      const res = await deleteUser(userId);
      error = res.error;
    } else if (type === 'activate') {
      const res = await activateSubscription(userId);
      error = res.error;
    }

    if (!error) {
      Alert.alert('Success', `Action "${type}" completed successfully.`);
      onRefresh();
    } else {
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  };

  const handleQuickActivate = async () => {
    if (!quickEmail || !quickDays) {
      Alert.alert('Error', 'Please enter email and days');
      return;
    }
    
    setLoading(true);
    const { error } = await activateSubscriptionByEmail(quickEmail, quickDays);
    setLoading(false);

    if (!error) {
      Alert.alert('Success', `Subscription activated for ${quickEmail}`);
      setQuickEmail('');
      onRefresh();
    } else {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ArrowLeft size={24} color={colors.text} onPress={() => navigation.goBack()} />
          <Text style={[styles.title, { color: colors.text }]}>User Management</Text>
        </View>

        {/* Quick Activate Section */}
        <View style={[styles.quickCard, { backgroundColor: colors.surface }]}>
          <Text style={styles.quickTitle}>QUICK ACTIVATE</Text>
          <View style={styles.quickRow}>
            <TextInput 
              style={[styles.quickInput, { color: colors.text, flex: 2 }]} 
              placeholder="User Email" 
              placeholderTextColor="#94A3B8"
              value={quickEmail}
              onChangeText={setQuickEmail}
              autoCapitalize="none"
            />
            <TextInput 
              style={[styles.quickInput, { color: colors.text, flex: 1 }]} 
              placeholder="Days" 
              placeholderTextColor="#94A3B8"
              value={quickDays}
              onChangeText={setQuickDays}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.quickBtn} onPress={handleQuickActivate}>
              <Text style={styles.quickBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
          <Search size={20} color="#94A3B8" />
          <TextInput 
            style={[styles.input, { color: colors.text }]} 
            placeholder="Search name or email..." 
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 50 }} />
      ) : (
        <FlatList 
          data={filteredUsers}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <UserCard user={item} colors={colors} onUpdate={handleUpdate} />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ color: '#94A3B8' }}>No users found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 15 },
  title: { fontSize: 22, fontWeight: '900' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '600' },
  list: { padding: 20, paddingTop: 0 },
  empty: { alignItems: 'center', marginTop: 100 },
  
  // Quick Activate Styles
  quickCard: {
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#6366F1',
    letterSpacing: 1,
    marginBottom: 10,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickInput: {
    height: 45,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  quickBtn: {
    backgroundColor: '#6366F1',
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 12,
  },
});

export default AdminUsers;

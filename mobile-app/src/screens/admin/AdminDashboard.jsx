import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Users, CreditCard, ShieldCheck, TrendingUp, ChevronRight, LifeBuoy } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import useAuthStore from '../../store/authStore';

const AdminDashboard = ({ navigation }) => {
  const { colors } = useTheme();
  const { fetchAdminStats } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const data = await fetchAdminStats();
    setStats(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Admin Panel</Text>
        <Text style={styles.subtitle}>Management Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsGrid}>
          <StatCard 
            title="Total Users" 
            value={stats.userCount} 
            icon={Users} 
            color="#6366F1" 
            colors={colors} 
          />
          <StatCard 
            title="Active Subs" 
            value={stats.subCount} 
            icon={ShieldCheck} 
            color="#10B981" 
            colors={colors} 
          />
          <StatCard 
            title="Revenue" 
            value={`₹${stats.revenue}`} 
            icon={TrendingUp} 
            color="#F59E0B" 
            colors={colors} 
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          <MenuButton 
            title="User Management" 
            sub="Block, Delete, Activate Subs" 
            icon={Users} 
            onPress={() => navigation.navigate('AdminUsers')} 
            colors={colors}
          />
          <MenuButton 
            title="Payment Requests" 
            sub="Verify manual UPI payments" 
            icon={CreditCard} 
            onPress={() => navigation.navigate('AdminPayments')} 
            colors={colors}
          />
          <MenuButton 
            title="Clinical Support" 
            sub="Resolve student complaints" 
            icon={LifeBuoy} 
            onPress={() => navigation.navigate('AdminSupport')} 
            colors={colors}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({ title, value, icon: Icon, color, colors }) => (
  <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
    <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
      <Icon size={20} color={color} />
    </View>
    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{title}</Text>
    <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
  </View>
);

const MenuButton = ({ title, sub, icon: Icon, onPress, colors }) => (
  <TouchableOpacity 
    style={[styles.menuItem, { backgroundColor: colors.surface }]} 
    onPress={onPress}
  >
    <View style={[styles.menuIconBox, { backgroundColor: '#6366F110' }]}>
      <Icon size={22} color="#6366F1" />
    </View>
    <View style={styles.menuText}>
      <Text style={[styles.menuLabel, { color: colors.text }]}>{title}</Text>
      <Text style={styles.menuSub}>{sub}</Text>
    </View>
    <ChevronRight size={20} color="#94A3B8" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#94A3B8', fontWeight: '600', marginTop: 4 },
  scrollContent: { padding: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 24,
    marginBottom: 15,
    elevation: 2,
    shadowOpacity: 0.05,
  },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 20, fontWeight: '900', marginTop: 4 },
  menuSection: { marginTop: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 15, marginLeft: 10 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 24,
    marginBottom: 12,
    elevation: 2,
    shadowOpacity: 0.05,
  },
  menuIconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: '700' },
  menuSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
});

export default AdminDashboard;

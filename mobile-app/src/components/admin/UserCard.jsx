import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { User, ShieldCheck, Ban, Trash2, Mail } from 'lucide-react-native';

const UserCard = ({ user, colors, onUpdate }) => {
  const isBlocked = user.status === 'blocked';
  const subscriptions = Array.isArray(user.subscriptions) ? user.subscriptions : (user.subscriptions ? [user.subscriptions] : []);
  const hasSub = subscriptions.some(s => s.status === 'active');

  const confirmAction = (title, message, action) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Proceed', style: 'destructive', onPress: action }
    ]);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: isBlocked ? '#FEE2E2' : '#EEF2FF' }]}>
          <User size={24} color={isBlocked ? '#EF4444' : '#6366F1'} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
          <View style={styles.emailRow}>
            <Mail size={12} color="#94A3B8" />
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: isBlocked ? '#EF444415' : '#10B98115' }]}>
          <Text style={[styles.badgeText, { color: isBlocked ? '#EF4444' : '#10B981' }]}>
            {isBlocked ? 'BLOCKED' : 'ACTIVE'}
          </Text>
        </View>
      </View>

      <View style={styles.subInfo}>
        <Text style={styles.subLabel}>Subscription:</Text>
        <Text style={[styles.subValue, { color: hasSub ? '#10B981' : '#94A3B8' }]}>
          {hasSub ? 'Premium Active' : 'Free Tier'}
        </Text>
      </View>

      <View style={styles.actions}>
        {!hasSub && (
          <ActionButton 
            label="Activate Sub" 
            icon={ShieldCheck} 
            color="#10B981" 
            onPress={() => confirmAction('Activate', `Give 90 days sub to ${user.name}?`, () => onUpdate('activate', user.id))} 
          />
        )}
        <ActionButton 
          label={isBlocked ? "Unblock" : "Block"} 
          icon={Ban} 
          color={isBlocked ? "#6366F1" : "#EF4444"} 
          onPress={() => onUpdate('status', user.id, isBlocked ? 'active' : 'blocked')} 
        />
        <ActionButton 
          label="Delete" 
          icon={Trash2} 
          color="#94A3B8" 
          onPress={() => confirmAction('Delete User', `Permanently delete ${user.name}? This cannot be undone.`, () => onUpdate('delete', user.id))} 
        />
      </View>
    </View>
  );
};

const ActionButton = ({ label, icon: Icon, color, onPress }) => (
  <TouchableOpacity 
    style={[styles.actionBtn, { borderColor: color + '30' }]} 
    onPress={onPress}
  >
    <Icon size={16} color={color} />
    <Text style={[styles.actionLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 2,
    shadowOpacity: 0.05,
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  emailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  email: { fontSize: 12, color: '#94A3B8', marginLeft: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '900' },
  subInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 15, 
    paddingTop: 15, 
    borderTopWidth: 1, 
    borderTopColor: '#F1F5F9' 
  },
  subLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  subValue: { fontSize: 12, fontWeight: '700', marginLeft: 6 },
  actions: { flexDirection: 'row', marginTop: 15, gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  actionLabel: { fontSize: 11, fontWeight: '700' },
});

export default UserCard;

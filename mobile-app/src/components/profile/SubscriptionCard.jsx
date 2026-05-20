import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Crown, Clock, Calendar, CircleCheck } from 'lucide-react-native';

const SubscriptionCard = ({ sub, colors }) => {
  const getDaysRemaining = () => {
    if (!sub?.end_date) return 0;
    const end = new Date(sub.end_date);
    const now = new Date();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#10B981';
      case 'expired': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#94A3B8';
    }
  };

  const daysRemaining = getDaysRemaining();
  const isActive = sub && sub.status === 'active' && daysRemaining > 0;

  if (isActive) {
    return (
      <View style={[
        styles.activeContainer, 
        { backgroundColor: '#D1FAE5', borderColor: '#10B981' }
      ]}>
        <View style={styles.subBannerLeft}>
          <View style={[styles.subIconBox, { backgroundColor: '#10B981' }]}>
            <CircleCheck size={18} color="#FFF" />
          </View>
          <View>
            <Text style={[styles.subStatusText, { color: '#065F46' }]}>
              PREMIUM ACTIVE
            </Text>
            <Text style={styles.subDetailText}>
              {daysRemaining} Days Remaining
            </Text>
          </View>
        </View>

        <View style={styles.subActionBox}>
          <Text style={[styles.subActionText, { color: '#10B981' }]}>
            ACTIVE
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Crown size={22} color="#F59E0B" />
          <Text style={[styles.title, { color: colors.text }]}>Premium Plan</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: getStatusColor(sub?.status) + '20' }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(sub?.status) }]}>
            {(sub?.status || 'None').toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Clock size={18} color="#94A3B8" />
          <Text style={styles.infoText}>{sub?.daysRemaining || 0} Days remaining</Text>
        </View>
        <View style={styles.infoRow}>
          <Calendar size={18} color="#94A3B8" />
          <Text style={styles.infoText}>{sub?.plan || 'No Active Plan'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.renewBtn}>
        <Text style={styles.renewText}>Renew Plan</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowOpacity: 0.05,
  },
  activeContainer: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowOpacity: 0.05,
  },
  subBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subStatusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subDetailText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 2,
  },
  subActionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subActionText: {
    fontSize: 12,
    fontWeight: '900',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  content: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    color: '#64748B',
    fontSize: 14,
    marginLeft: 12,
    fontWeight: '500',
  },
  renewBtn: {
    backgroundColor: '#6366F1',
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  renewText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default SubscriptionCard;

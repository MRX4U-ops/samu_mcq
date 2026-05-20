import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BookOpen, Zap, Trophy, Tag, AlertCircle, Bell } from 'lucide-react-native';

const NotificationCard = ({ item, colors, onPress }) => {
  const getIcon = () => {
    switch (item.type) {
      case 'study_reminder': return <BookOpen size={20} color="#6366F1" />;
      case 'streak': return <Zap size={20} color="#F59E0B" />;
      case 'leaderboard': return <Trophy size={20} color="#10B981" />;
      case 'offer': return <Tag size={20} color="#EC4899" />;
      case 'subscription': return <AlertCircle size={20} color="#EF4444" />;
      default: return <Bell size={20} color="#94A3B8" />;
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: item.is_read ? 'transparent' : '#F8FAFC' },
        !item.is_read && { borderLeftWidth: 4, borderLeftColor: '#6366F1' }
      ]} 
      onPress={() => onPress(item)}
    >
      <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
        {getIcon()}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: item.is_read ? '#475569' : '#0F172A' }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.time}>{getTimeAgo(item.created_at)}</Text>
        </View>
        <Text style={[styles.body, { color: '#64748B' }]} numberOfLines={2}>
          {item.body}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  time: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default NotificationCard;

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';

const LeaderboardRow = ({ item, rank, colors, isCurrentUser }) => {
  const getLevelBadge = (points) => {
    if (points >= 100000) return { title: 'Legend', icon: '🌟', color: '#8B5CF6' };
    if (points >= 40000) return { title: 'Elite', icon: '💎', color: '#3B82F6' };
    if (points >= 15000) return { title: 'Master', icon: '👑', color: '#F59E0B' };
    if (points >= 5000) return { title: 'Expert', icon: '🧠', color: '#10B981' };
    if (points >= 1000) return { title: 'Skilled', icon: '🚀', color: '#EC4899' };
    return { title: 'Beginner', icon: '🌱', color: '#94A3B8' };
  };

  const level = getLevelBadge(item.points);

  const renderTrend = () => {
    if (!item.trend) return <Minus size={14} color="#CBD5E1" />;
    if (item.trend === 'up') return <TrendingUp size={14} color="#10B981" />;
    if (item.trend === 'down') return <TrendingDown size={14} color="#EF4444" />;
    return <Minus size={14} color="#CBD5E1" />;
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: isCurrentUser ? colors.surface : 'transparent' },
        isCurrentUser && styles.currentUserShadow
      ]}
    >
      <View style={styles.rankSection}>
        <Text style={[styles.rankText, { color: colors.textSecondary }]}>{rank}</Text>
        <View style={styles.trendContainer}>{renderTrend()}</View>
      </View>

      <Image 
        source={{ uri: item.avatar_url || `https://ui-avatars.com/api/?name=${item.username}&background=random` }} 
        style={styles.avatar} 
      />

      <View style={styles.infoSection}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {item.username}
          </Text>
          <View style={[styles.levelBadge, { backgroundColor: level.color + '20' }]}>
            <Text style={[styles.levelIcon]}>{level.icon}</Text>
            <Text style={[styles.levelTitle, { color: level.color }]}>{level.title}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.scoreText}>{item.points} pts</Text>
          {item.current_streak > 0 && (
            <View style={styles.streakContainer}>
              <Flame size={12} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.streakText}>{item.current_streak}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginHorizontal: 8,
    marginBottom: 4,
  },
  currentUserShadow: {
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  rankSection: {
    width: 35,
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  trendContainer: {
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  infoSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 8,
    maxWidth: '60%',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  levelIcon: {
    fontSize: 10,
  },
  levelTitle: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '700',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '800',
  },
});

export default LeaderboardRow;

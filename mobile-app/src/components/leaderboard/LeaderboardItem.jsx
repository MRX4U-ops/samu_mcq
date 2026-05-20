import React from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Medal, Flame } from 'lucide-react-native';

const LeaderboardItem = ({ item, index, isCurrentUser }) => {
  const { colors } = useTheme();
  const rank = index + 1;
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor: colors.surface },
      isCurrentUser && { borderColor: colors.primary, borderWidth: 1.5, shadowColor: colors.primary, elevation: 5 }
    ]}>
      <View style={styles.rankSection}>
        <Text style={[styles.rankText, { color: colors.textSecondary }]}>{rank}</Text>
      </View>

      <View style={styles.avatarContainer}>
        <Image 
          source={item.profiles?.avatar_url ? { uri: item.profiles.avatar_url } : { uri: `https://ui-avatars.com/api/?name=${item.profiles?.name || 'Student'}&background=6366F1&color=fff` }} 
          style={styles.avatar}
        />
        {item.score > 500 && (
          <View style={styles.hotBadge}>
            <Flame size={10} color="#FFF" fill="#FFF" />
          </View>
        )}
      </View>

      <View style={styles.nameSection}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {item.profiles?.name || 'Medical Student'}
        </Text>
        {isCurrentUser && (
          <View style={[styles.youBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.youText, { color: colors.primary }]}>YOU</Text>
          </View>
        )}
      </View>

      <View style={styles.scoreSection}>
        <View style={styles.scoreRow}>
           <Text style={[styles.score, { color: colors.text }]}>{item.score}</Text>
           <Text style={styles.pts}>pts</Text>
        </View>
        <View style={[styles.trendBar, { backgroundColor: colors.primary + '10' }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 22,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  rankSection: { width: 25, alignItems: 'center' },
  rankText: { fontSize: 14, fontWeight: '900', fontStyle: 'italic' },
  avatarContainer: { position: 'relative' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F1F5F9' },
  hotBadge: { 
    position: 'absolute', 
    top: -4, 
    right: -4, 
    backgroundColor: '#EF4444', 
    width: 18, 
    height: 18, 
    borderRadius: 9, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF'
  },
  nameSection: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { fontSize: 15, fontWeight: '700' },
  youBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  youText: { fontSize: 10, fontWeight: '900' },
  scoreSection: { alignItems: 'flex-end' },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  score: { fontSize: 17, fontWeight: '900' },
  pts: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold' },
  trendBar: { width: 40, height: 3, borderRadius: 2, marginTop: 4 }
});

export default LeaderboardItem;

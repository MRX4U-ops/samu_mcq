import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Zap, Trophy, TrendingUp } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const StickyRankCard = ({ userRank, userPoints, topTenMinScore, colors, isDarkMode }) => {
  const isInTopTen = userRank > 0 && userRank <= 10;
  const pointsToTopTen = Math.max(0, topTenMinScore - userPoints);
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor: isDarkMode ? '#1E293B' : '#FFF', borderTopColor: colors.border }
    ]}>
      <View style={styles.rankInfo}>
        <View style={[styles.badge, { backgroundColor: isInTopTen ? '#FDE68A' : '#F1F5F9' }]}>
           <Trophy size={16} color={isInTopTen ? '#D97706' : '#64748B'} />
           <Text style={[styles.rankText, { color: isInTopTen ? '#D97706' : '#64748B' }]}>
             {userRank > 0 ? `#${userRank}` : '--'}
           </Text>
        </View>
        <View style={styles.pointsGroup}>
           <Text style={[styles.pointsLabel, { color: colors.textSecondary }]}>YOUR POINTS</Text>
           <Text style={[styles.pointsValue, { color: colors.text }]}>{userPoints} pts</Text>
        </View>
      </View>

      <View style={[styles.progressBox, { backgroundColor: isDarkMode ? '#334155' : '#F8FAFC' }]}>
        <View style={styles.progressHeader}>
           {isInTopTen ? (
             <>
               <Text style={styles.targetText}>🔥 You are in Top 10!</Text>
               <TrendingUp size={14} color="#10B981" />
             </>
           ) : (
             <>
               <Text style={styles.targetText}>⚡ {pointsToTopTen} pts to Top 10</Text>
               <Zap size={14} color="#F59E0B" fill="#F59E0B" />
             </>
           )}
        </View>
        <View style={styles.progressBarBg}>
           <View style={[
             styles.progressBarFill, 
             { width: `${Math.min(100, (userPoints / (topTenMinScore || 1)) * 100)}%` }
           ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: width,
    padding: 16,
    paddingBottom: 25, // For safe area
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  rankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 4,
  },
  pointsGroup: {
    justifyContent: 'center',
  },
  pointsLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  progressBox: {
    flex: 0.6,
    padding: 10,
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  targetText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 3,
  }
});

export default StickyRankCard;

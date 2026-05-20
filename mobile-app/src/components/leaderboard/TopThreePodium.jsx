import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { Trophy } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const TopThreePodium = ({ topThree, colors }) => {
  if (!topThree || topThree.length === 0) return null;

  const renderMember = (user, rank) => {
    const isFirst = rank === 1;
    const colorMap = {
      1: '#FFD700', // Gold
      2: '#C0C0C0', // Silver
      3: '#CD7F32', // Bronze
    };

    return (
      <View key={user.user_id} style={[styles.memberContainer, isFirst && styles.firstMember]}>
        <View style={styles.avatarWrapper}>
          <Image 
            source={{ uri: user.avatar_url || `https://ui-avatars.com/api/?name=${user.username || 'User'}&background=random` }} 
            style={[styles.avatar, { borderColor: colorMap[rank] }]} 
          />
          <View style={[styles.rankBadge, { backgroundColor: colorMap[rank] }]}>
            <Text style={styles.rankText}>{rank}</Text>
          </View>
        </View>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{user.username || 'Anonymous'}</Text>
        <Text style={styles.points}>{user.points} pts</Text>
        {isFirst && <Trophy size={16} color="#FFD700" fill="#FFD700" style={{marginTop: 4}} />}
      </View>
    );
  };

  return (
    <View style={styles.podiumContainer}>
      {topThree[1] && renderMember(topThree[1], 2)}
      {topThree[0] && renderMember(topThree[0], 1)}
      {topThree[2] && renderMember(topThree[2], 3)}
    </View>
  );
};

const styles = StyleSheet.create({
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingVertical: 30,
    paddingHorizontal: 10,
  },
  memberContainer: {
    alignItems: 'center',
    width: width * 0.28,
  },
  firstMember: {
    width: width * 0.34,
    transform: [{ scale: 1.1 }],
    zIndex: 10,
    marginBottom: 15,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  rankText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  points: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '800',
    marginTop: 2,
  },
});

export default TopThreePodium;

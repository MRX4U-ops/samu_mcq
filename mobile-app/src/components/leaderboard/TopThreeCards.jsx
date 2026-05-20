import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Flame, Trophy, Crown } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const TopThreeCards = ({ topThree }) => {
  const { colors } = useTheme();

  const renderCard = (user, rank) => {
    if (!user) return <View style={[styles.card, styles.emptyCard]} />;

    const isFirst = rank === 1;
    const isSecond = rank === 2;
    const isThird = rank === 3;

    const config = {
      1: { color: '#FCD34D', glow: '#F59E0B', scale: 1.1, offset: -20 },
      2: { color: '#E2E8F0', glow: '#94A3B8', scale: 0.95, offset: 0 },
      3: { color: '#FDBA74', glow: '#D97706', scale: 0.9, offset: 10 }
    }[rank];

    return (
      <Animated.View 
        entering={FadeInUp.delay(rank * 100)}
        style={[
          styles.card, 
          { 
            borderColor: config.color,
            transform: [{ scale: config.scale }, { translateY: config.offset }],
            shadowColor: config.glow,
          }
        ]}
      >
        {isFirst && <Crown size={24} color="#F59E0B" style={styles.crownIcon} />}
        
        <View style={[styles.avatarContainer, { borderColor: config.color }]}>
          <Image 
            source={{ uri: user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=random` }} 
            style={styles.avatar} 
          />
          <View style={[styles.rankBadge, { backgroundColor: config.color }]}>
            <Text style={styles.rankText}>{rank}</Text>
          </View>
        </View>

        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {user.username.split(' ')[0]}
        </Text>
        
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, { color: config.glow }]}>{user.points}</Text>
          <Text style={styles.pts}>pts</Text>
        </View>

        {user.current_streak > 0 && (
          <View style={styles.streakBadge}>
            <Flame size={12} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.streakText}>{user.current_streak}</Text>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.podium}>
        {renderCard(topThree[1], 2)}
        {renderCard(topThree[0], 1)}
        {renderCard(topThree[2], 3)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
  },
  card: {
    width: width * 0.28,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    elevation: 8,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginHorizontal: 4,
  },
  emptyCard: {
    opacity: 0.2,
    backgroundColor: '#F1F5F9',
    borderStyle: 'dashed',
  },
  crownIcon: {
    position: 'absolute',
    top: -25,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    padding: 2,
    marginBottom: 8,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    paddingHorizontal: 8,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  rankText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  score: {
    fontSize: 16,
    fontWeight: '900',
  },
  pts: {
    fontSize: 9,
    color: '#94A3B8',
    marginLeft: 2,
    fontWeight: 'bold',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  streakText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400E',
  },
});

export default TopThreeCards;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Swords, Trophy, TrendingUp } from 'lucide-react-native';

const MultiplayerCard = ({ stats, colors }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>MULTIPLAYER STATS</Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.stat}>
          <Swords size={20} color="#8B5CF6" />
          <Text style={[styles.value, { color: colors.text }]}>{stats.battlesPlayed || 0}</Text>
          <Text style={styles.label}>Battles</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Trophy size={20} color="#F59E0B" />
          <Text style={[styles.value, { color: colors.text }]}>{stats.wins || 0}</Text>
          <Text style={styles.label}>Wins</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <TrendingUp size={20} color="#10B981" />
          <Text style={[styles.value, { color: colors.text }]}>{stats.rank || 'N/A'}</Text>
          <Text style={styles.label}>Rank</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#94A3B8',
    marginBottom: 10,
    marginLeft: 10,
    letterSpacing: 1.2,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 28,
    elevation: 2,
    shadowOpacity: 0.05,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  label: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: '#F1F5F9',
    alignSelf: 'center',
  }
});

export default MultiplayerCard;

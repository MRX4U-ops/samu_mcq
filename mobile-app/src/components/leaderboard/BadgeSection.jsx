import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const BadgeSection = ({ userBadges, colors }) => {
  if (!userBadges || userBadges.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>YOUR BADGES</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeList}>
        {userBadges.map((badge, idx) => (
          <View key={idx} style={[styles.badgeCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.badgeIcon}>{badge.icon}</Text>
            <Text style={[styles.badgeName, { color: colors.text }]}>{badge.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginLeft: 20,
    marginBottom: 12,
  },
  badgeList: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  badgeCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 20,
    marginRight: 12,
    width: 100,
    elevation: 2,
    shadowOpacity: 0.05,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default BadgeSection;

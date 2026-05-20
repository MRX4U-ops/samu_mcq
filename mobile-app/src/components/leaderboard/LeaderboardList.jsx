import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { Award } from 'lucide-react-native';

const LeaderboardList = ({ data, colors, isDarkMode, currentUserId }) => {
  const renderItem = ({ item, index }) => {
    const isCurrentUser = item.user_id === currentUserId;
    const rank = index + 1;

    return (
      <View style={[
        styles.row, 
        { borderBottomColor: colors.border },
        isCurrentUser && { backgroundColor: isDarkMode ? '#1E293B' : '#EFF6FF', borderRadius: 12 }
      ]}>
        <View style={styles.left}>
          <Text style={[styles.rankText, { color: colors.textSecondary }]}>{rank}</Text>
          <Image 
            source={{ uri: item.avatar_url || `https://ui-avatars.com/api/?name=${item.username || 'User'}&background=random` }} 
            style={styles.avatar} 
          />
          <View>
            <Text style={[styles.name, { color: colors.text }, isCurrentUser && { fontWeight: '900' }]}>
              {item.username || 'Anonymous'}
            </Text>
            {rank <= 10 && (
              <View style={styles.badgeRow}>
                <Award size={10} color="#10B981" />
                <Text style={styles.badgeText}>Elite Tier</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.right}>
           <Text style={[styles.points, { color: colors.primary }]}>{item.points}</Text>
           <Text style={styles.ptsLabel}>pts</Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.user_id}
      scrollEnabled={false} // Managed by parent ScrollView
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 15,
    paddingBottom: 100,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 25,
    textAlign: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  badgeText: {
    fontSize: 9,
    color: '#10B981',
    fontWeight: 'bold',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  right: {
    alignItems: 'flex-end',
  },
  points: {
    fontSize: 18,
    fontWeight: '900',
  },
  ptsLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: 'bold',
    marginTop: -2,
  }
});

export default LeaderboardList;

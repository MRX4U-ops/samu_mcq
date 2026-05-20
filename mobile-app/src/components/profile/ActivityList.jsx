import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { History, ChevronRight } from 'lucide-react-native';

const ActivityList = ({ history, colors }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Recent Activity</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.list, { backgroundColor: colors.surface }]}>
        {history.length > 0 ? history.map((item, idx) => (
          <TouchableOpacity key={idx} style={[styles.item, idx !== history.length - 1 && styles.border]}>
            <View style={styles.iconBox}>
              <History size={18} color="#6366F1" />
            </View>
            <View style={styles.content}>
              <Text style={[styles.topic, { color: colors.text }]}>{item.topic}</Text>
              <Text style={styles.sub}>{item.date} • {item.type}</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.score}>{item.score}</Text>
              <ChevronRight size={16} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        )) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No activity yet</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 2,
    shadowOpacity: 0.05,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#6366F110',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  topic: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
    marginRight: 8,
  },
  empty: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});

export default ActivityList;

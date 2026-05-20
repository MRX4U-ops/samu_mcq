import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircleCheck, CircleX, BarChart2, Target } from 'lucide-react-native';

const StatsCard = ({ stats, colors }) => {
  const data = [
    { label: 'Total', value: stats.total || 0, icon: BarChart2, color: '#6366F1' },
    { label: 'Correct', value: stats.correct || 0, icon: CircleCheck, color: '#10B981' },
    { label: 'Wrong', value: stats.wrong || 0, icon: CircleX, color: '#EF4444' },
    { label: 'Accuracy', value: `${stats.accuracy || 0}%`, icon: Target, color: '#F59E0B' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {data.map((item, idx) => (
          <View key={idx} style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
              <item.icon size={20} color={item.color} />
            </View>
            <Text style={[styles.value, { color: colors.text }]}>{item.value}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    padding: 20,
    borderRadius: 24,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 4,
  },
});

export default StatsCard;

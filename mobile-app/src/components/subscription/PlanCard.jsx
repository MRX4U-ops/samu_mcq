import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircleCheck, Crown } from 'lucide-react-native';

const PlanCard = ({ colors }) => {
  const features = [
    'All courses unlocked',
    'All MCQs access',
    'Multiplayer quiz',
    'AI features'
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Crown size={24} color="#F59E0B" />
          <Text style={[styles.title, { color: colors.text }]}>SAMU Premium</Text>
        </View>
        <View style={styles.priceBox}>
          <Text style={styles.price}>₹49</Text>
          <Text style={styles.duration}>/ 90 days</Text>
        </View>
      </View>
      
      <View style={styles.features}>
        {features.map((feat, idx) => (
          <View key={idx} style={styles.featureItem}>
            <CircleCheck size={18} color="#10B981" />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>{feat}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowOpacity: 0.05,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    marginLeft: 10,
  },
  priceBox: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  duration: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  features: {
    marginTop: 5,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  }
});

export default PlanCard;

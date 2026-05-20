import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, CircleCheck, Clock } from 'lucide-react-native';

const PaymentStatusCard = ({ status, colors }) => {
  const getStatusDetails = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: '#F59E0B',
          bg: '#FEF3C7',
          title: 'Verification in Progress',
          message: 'Your payment is being manually verified. This usually takes 5-10 minutes.'
        };
      case 'approved':
      case 'active':
        return {
          icon: CircleCheck,
          color: '#10B981',
          bg: '#D1FAE5',
          title: 'Subscription Active',
          message: 'You have full premium access.'
        };
      case 'rejected':
        return {
          icon: AlertCircle,
          color: '#EF4444',
          bg: '#FEE2E2',
          title: 'Payment Rejected',
          message: 'Your transaction could not be verified. Please try again or contact support.'
        };
      case 'expired':
        return {
          icon: AlertCircle,
          color: '#64748B',
          bg: '#F1F5F9',
          title: 'Request Expired',
          message: 'Your payment request expired after 30 minutes. Please generate a new one.'
        };
      default:
        return null;
    }
  };

  const details = getStatusDetails();
  if (!details) return null;

  return (
    <View style={[styles.container, { backgroundColor: details.bg }]}>
      <details.icon size={28} color={details.color} style={styles.icon} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: details.color }]}>{details.title}</Text>
        <Text style={styles.message}>{details.message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 15,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  }
});

export default PaymentStatusCard;

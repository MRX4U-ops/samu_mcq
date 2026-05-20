import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { paymentService } from '../services/paymentService';
import { CircleCheck } from 'lucide-react-native';

const PaymentFormScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { reference } = route.params || {};
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (transactionId.length < 8) {
      Alert.alert("Invalid Input", "Transaction ID must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      await paymentService.submitPayment(transactionId.trim());
      Alert.alert(
        "Success", 
        "Payment submitted successfully! Admin will verify and activate your subscription shortly.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert("Error", e.response?.data?.error || "Failed to submit transaction ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.iconBox}>
          <CircleCheck size={40} color="#10B981" />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Submit Payment</Text>
        <Text style={styles.sub}>Enter your 12-digit UPI Transaction ID or UTR number below to confirm your payment.</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Reference Note:</Text>
          <Text style={styles.infoValue}>{reference || 'Unknown'}</Text>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Transaction ID (UTR)</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="e.g. 302149581938"
          placeholderTextColor="#94A3B8"
          value={transactionId}
          onChangeText={setTransactionId}
          autoCapitalize="none"
          keyboardType="numeric"
        />

        <TouchableOpacity 
          style={[styles.btn, (!transactionId || transactionId.length < 8) && styles.btnDisabled]} 
          onPress={handleSubmit}
          disabled={!transactionId || transactionId.length < 8 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.btnText}>Submit for Verification</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    padding: 25,
    borderRadius: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  sub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoLabel: {
    color: '#475569',
    fontWeight: '600',
  },
  infoValue: {
    color: '#0F172A',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 30,
  },
  btn: {
    backgroundColor: '#6366F1',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: '#A5B4FC',
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default PaymentFormScreen;

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Linking, 
  Alert, 
  TextInput,
  Clipboard
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Copy, CircleCheck, Smartphone, Info, RefreshCcw, Ticket } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import useAuthStore from '../store/authStore';
import useSubscriptionStore from '../store/subscriptionStore';

const SubscriptionScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { 
    subscription, 
    paymentRequests, 
    isLoading, 
    error,
    fetchSubscriptionStatus,
    fetchPaymentRequests,
    createPaymentRequest,
    generatePaymentReference 
  } = useSubscriptionStore();

  const [transactionId, setTransactionId] = useState('');
  const [currentReference, setCurrentReference] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const BASE_PRICE = 199;
  const currentPrice = appliedPromo 
    ? Math.floor(BASE_PRICE - (BASE_PRICE * appliedPromo.discount_percentage / 100))
    : BASE_PRICE;

  useEffect(() => {
    if (user) {
      fetchSubscriptionStatus(user.id);
      fetchPaymentRequests(user.id);
      setCurrentReference(generatePaymentReference(user.id));
    }
  }, [user]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    
    setIsApplyingPromo(true);
    const result = await useSubscriptionStore.getState().validatePromoCode(promoCode.trim().toUpperCase());
    setIsApplyingPromo(false);

    if (result && result.valid) {
      setAppliedPromo(result);
      Alert.alert("Promo Applied!", `You got a ${result.discount_percentage}% discount.`);
    } else {
      Alert.alert("Invalid Code", result?.message || "This promocode is not valid.");
      setAppliedPromo(null);
    }
  };

  const handlePayNow = async () => {
    const upiUrl = `upi://pay?pa=suhailsaikh@ybl&pn=SAMU%20MCQs&am=${currentPrice}&cu=INR&tn=${currentReference}`;
    
    try {
      const canOpen = await Linking.canOpenURL(upiUrl);
      if (canOpen) {
        await Linking.openURL(upiUrl);
      } else {
        Alert.alert(
          "UPI App Not Found",
          "No UPI apps detected. Please copy the UPI ID and Note manually to pay in GPay, PhonePe, or Paytm.",
          [{ text: "OK" }]
        );
      }
    } catch (e) {
      Alert.alert("Error", "Could not open UPI app.");
    }
  };

  const handleSubmitPayment = async () => {
    if (transactionId.trim().length < 8) {
      Alert.alert("Invalid ID", "Please enter a valid Transaction ID (min 8 characters).");
      return;
    }

    const { error: submitError } = await createPaymentRequest(
      user.id, 
      transactionId, 
      currentReference,
      currentPrice,
      appliedPromo?.id
    );
    if (submitError) {
      Alert.alert("Error", submitError);
    } else {
      Alert.alert("Success", "Payment submitted! Our team will verify it within 2-4 hours.");
      setTransactionId('');
      setAppliedPromo(null);
      setPromoCode('');
      // Generate a new reference for potential next attempt if this one gets rejected
      setCurrentReference(generatePaymentReference(user.id));
    }
  };

  const copyToClipboard = (text, label) => {
    Clipboard.setString(text);
    Alert.alert("Copied", `${label} copied to clipboard!`);
  };

  const activeRequest = paymentRequests.find(r => r.status === 'pending');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Plan Summary */}
        <View style={styles.topCard}>
          <Text style={styles.topCardSub}>PREMIUM ACCESS</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {appliedPromo && <Text style={styles.originalPrice}>₹{BASE_PRICE}</Text>}
            <Text style={styles.topCardPrice}>₹{currentPrice}</Text>
          </View>
          <Text style={styles.topCardValidity}>FOR 90 DAYS</Text>
          <View style={styles.divider} />
          <Text style={styles.topCardDesc}>
            Unlock all MCQ Modules, Multiplayer Battles, and AI Medical Assistant.
          </Text>
        </View>

        {subscription ? (
          <View style={styles.activeSubCard}>
            <CircleCheck size={24} color="#10B981" />
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.activeSubTitle}>Active Subscription</Text>
              <Text style={styles.activeSubDate}>Valid until: {new Date(subscription.end_date).toLocaleDateString()}</Text>
            </View>
          </View>
        ) : activeRequest ? (
          <View style={styles.pendingCard}>
            <RefreshCcw size={24} color="#D97706" />
            <View style={{ marginLeft: 15, flex: 1 }}>
              <Text style={styles.pendingTitle}>Payment Pending Verification</Text>
              <Text style={styles.pendingDesc}>Reference: {activeRequest.payment_reference}</Text>
              <Text style={styles.pendingStatus}>Wait for admin approval (usually 2-4 hrs)</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.mainCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.stepTitle}>Step 1: Pay via UPI</Text>
            
            <View style={styles.paymentInfoRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>UPI ID</Text>
                <Text style={styles.infoValue}>suhailsaikh@ybl</Text>
              </View>
              <TouchableOpacity onPress={() => copyToClipboard('suhailsaikh@ybl', 'UPI ID')} style={styles.copyBtn}>
                <Copy size={18} color="#6366F1" />
              </TouchableOpacity>
            </View>

            <View style={styles.paymentInfoRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Payment Note (MANDATORY)</Text>
                <Text style={[styles.infoValue, { color: '#EF4444' }]}>{currentReference}</Text>
              </View>
              <TouchableOpacity onPress={() => copyToClipboard(currentReference, 'Payment Note')} style={styles.copyBtn}>
                <Copy size={18} color="#6366F1" />
              </TouchableOpacity>
            </View>

            <View style={styles.qrSection}>
              <View style={styles.qrBox}>
                <QRCode
                  value={`upi://pay?pa=suhailsaikh@ybl&pn=SAMU%20MCQs&am=${currentPrice}&cu=INR&tn=${currentReference}`}
                  size={160}
                />
              </View>
              <TouchableOpacity style={styles.deepLinkBtn} onPress={handlePayNow}>
                <Smartphone size={20} color="#FFF" />
                <Text style={styles.deepLinkText}>Open UPI App Directly</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.warningBox}>
              <Info size={16} color="#B45309" />
              <Text style={styles.warningText}>
                Do NOT change the Payment Note. If changed, your verification will fail.
              </Text>
            </View>

            <View style={styles.sectionDivider} />

            <Text style={styles.stepTitle}>Have a Promocode?</Text>
            <View style={styles.promoContainer}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 10 }]}
                placeholder="Enter Code (e.g. TRH20)"
                placeholderTextColor="#94A3B8"
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
                editable={!appliedPromo}
              />
              <TouchableOpacity 
                style={[styles.applyBtn, (appliedPromo || !promoCode.trim() || isApplyingPromo) && { opacity: 0.6 }]} 
                onPress={handleApplyPromo}
                disabled={!!appliedPromo || !promoCode.trim() || isApplyingPromo}
              >
                {isApplyingPromo ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.applyBtnText}>{appliedPromo ? 'Applied' : 'Apply'}</Text>
                )}
              </TouchableOpacity>
            </View>
            {appliedPromo && (
              <View style={styles.promoSuccess}>
                <Ticket size={14} color="#10B981" />
                <Text style={styles.promoSuccessText}>Applied: {appliedPromo.discount_percentage}% discount</Text>
                <TouchableOpacity onPress={() => { setAppliedPromo(null); setPromoCode(''); }}>
                  <Text style={styles.removePromo}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.sectionDivider} />

            <Text style={styles.stepTitle}>Step 2: Submit Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Transaction ID / UTR"
              placeholderTextColor="#94A3B8"
              value={transactionId}
              onChangeText={setTransactionId}
              autoCapitalize="characters"
            />

            <TouchableOpacity 
              style={[styles.submitBtn, isLoading && { opacity: 0.7 }]} 
              onPress={handleSubmitPayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>I Have Paid</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* History List */}
        {paymentRequests.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Payment History</Text>
            {paymentRequests.map((req) => (
              <View key={req.id} style={styles.historyItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyRef}>{req.payment_reference}</Text>
                  <Text style={styles.historyDate}>{new Date(req.created_at).toLocaleDateString()}</Text>
                </View>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: req.status === 'approved' ? '#D1FAE5' : req.status === 'rejected' ? '#FEE2E2' : '#FEF3C7' }
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    { color: req.status === 'approved' ? '#065F46' : req.status === 'rejected' ? '#991B1B' : '#92400E' }
                  ]}>
                    {req.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  topCard: {
    margin: 20,
    backgroundColor: '#6366F1',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  topCardSub: { color: '#FFF', fontSize: 12, fontWeight: '900', opacity: 0.8, letterSpacing: 2 },
  topCardPrice: { color: '#FFF', fontSize: 48, fontWeight: 'bold', marginTop: 5 },
  topCardValidity: { color: '#FFF', fontSize: 14, fontWeight: 'bold', opacity: 0.9 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', width: '100%', marginVertical: 15 },
  topCardDesc: { color: '#FFF', fontSize: 13, textAlign: 'center', opacity: 0.9, lineHeight: 18 },
  
  activeSubCard: {
    marginHorizontal: 20,
    backgroundColor: '#D1FAE5',
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  activeSubTitle: { color: '#065F46', fontSize: 18, fontWeight: 'bold' },
  activeSubDate: { color: '#047857', fontSize: 14, marginTop: 2 },

  pendingCard: {
    marginHorizontal: 20,
    backgroundColor: '#FEF3C7',
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  pendingTitle: { color: '#92400E', fontSize: 16, fontWeight: 'bold' },
  pendingDesc: { color: '#B45309', fontSize: 13, marginTop: 2 },
  pendingStatus: { color: '#D97706', fontSize: 12, fontWeight: 'bold', marginTop: 4 },

  mainCard: {
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 20,
    elevation: 3,
    shadowOpacity: 0.05,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
  paymentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  infoLabel: { fontSize: 10, color: '#64748B', textTransform: 'uppercase', fontWeight: 'bold' },
  infoValue: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginTop: 2 },
  copyBtn: { padding: 8, backgroundColor: '#EEF2FF', borderRadius: 10 },

  qrSection: { alignItems: 'center', marginVertical: 20 },
  qrBox: { padding: 10, backgroundColor: '#FFF', borderRadius: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  deepLinkBtn: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 15,
    width: '100%',
    justifyContent: 'center',
  },
  deepLinkText: { color: '#FFF', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },

  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    alignItems: 'center',
  },
  warningText: { flex: 1, color: '#B45309', fontSize: 12, marginLeft: 10, lineHeight: 16 },
  
  sectionDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 25 },
  
  input: {
    backgroundColor: '#F8FAFC',
    height: 55,
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#334155',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 15,
  },
  submitBtn: {
    backgroundColor: '#10B981',
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  historySection: { margin: 20 },
  historyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyRef: { fontSize: 14, fontWeight: 'bold', color: '#334155' },
  historyDate: { fontSize: 12, color: '#64748B', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { fontSize: 10, fontWeight: 'bold' },
  
  originalPrice: { 
    color: '#FFF', 
    fontSize: 24, 
    textDecorationLine: 'line-through', 
    opacity: 0.6, 
    marginRight: 10,
    marginTop: 10
  },
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  applyBtn: {
    backgroundColor: '#6366F1',
    height: 55,
    paddingHorizontal: 20,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: { color: '#FFF', fontWeight: 'bold' },
  promoSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 10,
    marginTop: 5,
  },
  promoSuccessText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
    flex: 1,
  },
  removePromo: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 5,
  }
});

export default SubscriptionScreen;

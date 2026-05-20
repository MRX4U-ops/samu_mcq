import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Lock, CreditCard } from 'lucide-react-native';
import useAuthStore from '../store/authStore';
import { useNavigation } from '@react-navigation/native';
import OfferPopup from './OfferPopup';

const AuthGuard = ({ children, requireSubscription = true }) => {
  const { user, profile, subscription, loading, offerPopupShown, setOfferPopupShown } = useAuthStore();
  const navigation = useNavigation();
  const [showOffer, setShowOffer] = React.useState(false);

  React.useEffect(() => {
    if (requireSubscription && !subscription && user && !offerPopupShown) {
      setShowOffer(true);
      setOfferPopupShown(true);
    }
  }, [requireSubscription, subscription, user, offerPopupShown]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading authentication...</Text>
      </View>
    );
  }

  if (!user) {
    // This should ideally be handled by navigation logic, but as a fallback:
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Lock size={64} color="#6366F1" />
          <Text style={styles.title}>Authentication Required</Text>
          <Text style={styles.subtitle}>Please login to access this medical resource.</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  if (profile?.status === 'blocked') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Lock size={64} color="#EF4444" />
          <Text style={[styles.title, { color: '#EF4444' }]}>Account Blocked</Text>
          <Text style={styles.subtitle}>
            Your account has been suspended for violating professional guidelines. 
            Please contact support for more information.
          </Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#EF4444' }]} onPress={() => useAuthStore.getState().signOut()}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  if (requireSubscription && !subscription) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <CreditCard size={64} color="#F59E0B" />
          <Text style={styles.title}>Subscription Required</Text>
          <Text style={styles.subtitle}>
            This content is exclusive to subscribed medical professionals.
          </Text>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#F59E0B' }]} 
            onPress={() => navigation.navigate('Subscription')}
          >
            <Text style={styles.buttonText}>View Subscription Plans</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Go Back</Text>
          </TouchableOpacity>
        </View>
        <OfferPopup visible={showOffer} onClose={() => setShowOffer(false)} />
      </SafeAreaView>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 30, justifyContent: 'center', alignItems: 'center', textAlign: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginTop: 20, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748B', marginBottom: 30, textAlign: 'center' },
  button: { backgroundColor: '#6366F1', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 12 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  linkBtn: { marginTop: 20 },
  linkText: { color: '#6366F1', fontWeight: 'bold' }
});

export default AuthGuard;

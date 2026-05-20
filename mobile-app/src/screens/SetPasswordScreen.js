import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { supabase } from '../services/supabaseClient';
import useAuthStore from '../store/authStore';

const SetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setRecovering } = useAuthStore();

  const handleUpdate = async () => {
    if (password.length < 6) {
      Alert.alert("Security Alert", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      Alert.alert("Success", "Your password has been updated. You can now use your account.");
      setRecovering(false); // This will trigger AppNavigator to show Home
    } catch (error) {
      Alert.alert("Update Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <ShieldCheck size={40} color="#6366F1" />
        </View>
        
        <Text style={styles.title}>Secure Your Account</Text>
        <Text style={styles.subtitle}>
          Almost there! Please set a new password to complete your recovery.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputBox}>
            <Lock size={20} color="#94A3B8" />
            <TextInput 
              style={styles.input} 
              placeholder="••••••••" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry 
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.buttonText}>Finish & Start Using App</Text>
              <ArrowRight size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1E293B', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 40 },
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 8 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  input: { flex: 1, height: 55, color: '#1E293B', fontSize: 16, marginLeft: 10 },
  button: { backgroundColor: '#6366F1', height: 55, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginRight: 10 }
});

export default SetPasswordScreen;

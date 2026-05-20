import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Mail, Lock, User, ArrowRight, ShieldCheck, CircleCheck } from 'lucide-react-native';
import useAuthStore from '../store/authStore';
import Constants from 'expo-constants';

const LoginScreen = ({ navigation }) => {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'otp', 'forgot_password', 'set_password'
  const [otpType, setOtpType] = useState('signup'); // 'signup' or 'recovery'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [otp, setOtp] = useState('');
  
  const { signIn, signUp, verifyOTP, resendOTP, resetPassword, setRecovering, loading, isActionLoading, error, clearError } = useAuthStore();

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleAction = async () => {
    clearError();

    if (mode === 'otp') {
      if (otp.length < 6) {
        Alert.alert("Invalid Code", "Please enter the verification code sent to your email.");
        return;
      }
      
      const { error: otpError } = await verifyOTP(email, otp, otpType);
      if (otpError) {
        Alert.alert("Verification Failed", otpError.message || "The code is incorrect or expired.");
      } else if (otpType === 'recovery') {
        // Small delay to ensure any auth state listeners have fired
        setTimeout(() => {
          setMode('set_password');
          setOtp('');
        }, 500);
      }
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a professionally formatted email address.");
      return;
    }

    if (mode === 'forgot_password') {
      const { error: resetError } = await resetPassword(email);
      if (resetError) {
        Alert.alert("Error", resetError.message);
      } else {
        Alert.alert("Email Sent", "A 6-digit reset code has been sent to your email.");
        setOtpType('recovery');
        setRecovering(true); // Prevent automatic redirection
        setMode('otp');
      }
      return;
    }
    
    if (mode === 'set_password') {
      if (password.length < 6) {
        Alert.alert("Security Alert", "New password must be at least 6 characters.");
        return;
      }
      
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        Alert.alert("Update Failed", updateError.message);
      } else {
        Alert.alert("Success", "Password updated successfully. You can now log in.");
        setRecovering(false); // Allow redirection now if session exists
        setMode('login');
      }
      return;
    }

    if (password.length < 6) {
      Alert.alert("Security Alert", "Password must be at least 6 characters.");
      return;
    }

    // Mock device ID for simulation
    const deviceId = `${Platform.OS}-${Constants.deviceName || 'mobile-device'}`;

    if (mode === 'login') {
      const { data, error: signInError } = await signIn(email, password, deviceId);
      if (signInError) {
        Alert.alert("Authentication Failed", signInError.message);
      } else if (data?.user && !data.user.email_confirmed_at) {
        setOtpType('signup');
        setMode('otp');
      }
    } else if (mode === 'signup') {
      if (name.length < 2) {
        Alert.alert("Identity Error", "Please enter your full professional name.");
        return;
      }
      const { data, error: signUpError } = await signUp(email, password, name);
      if (signUpError) {
        Alert.alert("Registration Failed", signUpError.message);
      } else if (data?.session) {
        // Confirmation is OFF, user is already logged in
        Alert.alert("Success", `Welcome Dr. ${name}! Your account is ready.`);
      } else {
        // Confirmation is ON, show OTP screen
        setOtpType('signup');
        setMode('otp');
      }
    }
  };

  const handleResend = async () => {
    const { error: resendError } = await resendOTP(email, otpType);
    if (resendError) {
      Alert.alert("Resend Failed", resendError.message);
    } else {
      Alert.alert("Code Sent", "A new verification code has been sent to your email.");
    }
  };

  if (mode === 'otp') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
          <View style={[styles.logoCirc, { backgroundColor: '#EEF2FF' }]}>
             <ShieldCheck size={40} color="#6366F1" />
          </View>
          <Text style={styles.title}>Enter Code</Text>
          <Text style={styles.subtitle}>We've sent a verification code to {email}. Check your inbox and spam folder.</Text>
          
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Verification Code</Text>
              <View style={styles.inputBox}>
                <Lock size={20} color="#94A3B8" />
                <TextInput 
                   style={[styles.input, { fontSize: 24, letterSpacing: 8, fontWeight: 'bold' }]} 
                  placeholder="00000000" 
                  value={otp} 
                  onChangeText={setOtp} 
                  keyboardType="number-pad"
                  maxLength={8}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, isActionLoading && styles.buttonDisabled]} 
              onPress={handleAction}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Verify Code</Text>
                  <CircleCheck size={20} color="#FFF" />
                </>
              )}
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity onPress={handleResend} disabled={isActionLoading}>
                <Text style={styles.linkText}>Resend Code</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => { setMode('login'); setOtp(''); }} disabled={isActionLoading}>
                <Text style={styles.linkText}>Change Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <View style={styles.logoCirc}>
           <View style={styles.logoInner} />
        </View>
        
        <Text style={styles.title}>
          {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join SAMU MCQs' : mode === 'set_password' ? 'New Password' : 'Reset Password'}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'login' ? 'Sign in to your medical account' : mode === 'signup' ? 'Start your professional medical journey' : mode === 'set_password' ? 'Secure your account with a new password' : 'Enter your email to receive a reset link'}
        </Text>

        <View style={styles.formCard}>
          {mode === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Professional Name</Text>
              <View style={styles.inputBox}>
                <User size={20} color="#94A3B8" />
                <TextInput 
                  style={styles.input} 
                  placeholder="Dr. Jasur Toshmatov" 
                  value={name} 
                  onChangeText={setName} 
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Institutional Email</Text>
            <View style={styles.inputBox}>
              <Mail size={20} color="#94A3B8" />
              <TextInput 
                style={styles.input} 
                placeholder="student@meduniver.uz" 
                value={email} 
                onChangeText={setEmail} 
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {mode !== 'forgot_password' && mode !== 'set_password' && (
            <View style={styles.inputGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.label}>Secure Password</Text>
                {mode === 'login' && (
                  <TouchableOpacity onPress={() => setMode('forgot_password')}>
                    <Text style={[styles.linkText, { fontSize: 12 }]}>Forgot Password?</Text>
                  </TouchableOpacity>
                )}
              </View>
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
          )}

          {mode === 'set_password' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Enter New Password</Text>
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
          )}

          <TouchableOpacity 
            style={[styles.button, isActionLoading && styles.buttonDisabled]} 
            onPress={handleAction}
            disabled={isActionLoading}
          >
            {isActionLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {mode === 'login' ? 'Authenticate' : mode === 'signup' ? 'Register Account' : mode === 'set_password' ? 'Update Password' : 'Send Reset Link'}
                </Text>
                <ArrowRight size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkBtn} 
            onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            <Text style={styles.linkText}>
              {mode === 'login' ? "Don't have an account? Create one" : "Back to Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, padding: 25, justifyContent: 'center', alignItems: 'center' },
  logoCirc: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  logoInner: { width: 30, height: 30, borderRadius: 6, borderWidth: 4, borderColor: '#FFF' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748B', marginBottom: 35, textAlign: 'center' },
  formCard: { backgroundColor: '#FFF', width: '100%', padding: 25, borderRadius: 32, elevation: 8, shadowOpacity: 0.1, shadowRadius: 15 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#475569', marginBottom: 8 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 16, paddingHorizontal: 15 },
  input: { flex: 1, height: 56, marginLeft: 12, color: '#1E293B', fontSize: 15 },
  button: { backgroundColor: '#2563EB', height: 60, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#94A3B8' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginRight: 10 },
  linkBtn: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#6366F1', fontWeight: 'bold', fontSize: 14 }
});

export default LoginScreen;


import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, Bell, Zap, Trophy, Tag, AlertCircle, Swords } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../services/supabaseClient';
import useAuthStore from '../store/authStore';

const NotificationSettings = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    study_reminders: true,
    streak_alerts: true,
    leaderboard_updates: true,
    subscription_alerts: true,
    offers_promotions: true,
    battle_invites: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) setSettings(data);
    else if (error && error.code === 'PGRST116') {
      // If no settings exist yet, create them
      await supabase.from('notification_settings').insert({ user_id: user.id });
    }
    setLoading(false);
  };

  const toggleSetting = async (key) => {
    const newVal = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newVal }));
    
    const { error } = await supabase
      .from('notification_settings')
      .update({ [key]: newVal })
      .eq('user_id', user.id);
      
    if (error) {
      Alert.alert("Error", "Could not update setting.");
      setSettings(prev => ({ ...prev, [key]: !newVal })); // Rollback
    }
  };

  const SettingRow = ({ label, desc, icon: Icon, value, onToggle, iconColor }) => (
    <View style={[styles.row, { backgroundColor: colors.surface }]}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
        <Icon size={20} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <Text style={styles.desc}>{desc}</Text>
      </View>
      <Switch 
        value={value} 
        onValueChange={onToggle}
        trackColor={{ false: "#D1D5DB", true: "#A5B4FC" }}
        thumbColor={value ? "#6366F1" : "#F3F4F6"}
      />
    </View>
  );

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#6366F1" /></View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Alert Preferences</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STUDY & ENGAGEMENT</Text>
          <SettingRow 
            label="Daily Reminders" 
            desc="Don't miss your clinical practice"
            icon={Bell}
            iconColor="#6366F1"
            value={settings.study_reminders}
            onToggle={() => toggleSetting('study_reminders')}
          />
          <SettingRow 
            label="Streak Warnings" 
            desc="Alerts when your streak is about to break"
            icon={Zap}
            iconColor="#F59E0B"
            value={settings.streak_alerts}
            onToggle={() => toggleSetting('streak_alerts')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ARENA & SOCIAL</Text>
          <SettingRow 
            label="Leaderboard Updates" 
            desc="When you enter Top 10 or get overtaken"
            icon={Trophy}
            iconColor="#10B981"
            value={settings.leaderboard_updates}
            onToggle={() => toggleSetting('leaderboard_updates')}
          />
          <SettingRow 
            label="Battle Invites" 
            desc="Real-time quiz challenges from peers"
            icon={Swords}
            iconColor="#8B5CF6"
            value={settings.battle_invites}
            onToggle={() => toggleSetting('battle_invites')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BILLING & DEALS</Text>
          <SettingRow 
            label="Subscription Alerts" 
            desc="Reminders before your premium access ends"
            icon={AlertCircle}
            iconColor="#EF4444"
            value={settings.subscription_alerts}
            onToggle={() => toggleSetting('subscription_alerts')}
          />
          <SettingRow 
            label="Offers & Promotions" 
            desc="Exclusive discounts and clinical bundles"
            icon={Tag}
            iconColor="#EC4899"
            value={settings.offers_promotions}
            onToggle={() => toggleSetting('offers_promotions')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, height: 80, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 15, marginLeft: 5 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 12, elevation: 2, shadowOpacity: 0.05 },
  iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textContainer: { flex: 1 },
  label: { fontSize: 15, fontWeight: 'bold' },
  desc: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default NotificationSettings;

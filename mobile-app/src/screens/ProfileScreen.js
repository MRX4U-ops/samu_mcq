import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import useAuthStore from '../store/authStore';

// Components
import ProfileHeader from '../components/profile/ProfileHeader';
import StatsCard from '../components/profile/StatsCard';
import SubscriptionCard from '../components/profile/SubscriptionCard';
import ActivityList from '../components/profile/ActivityList';
import MenuList from '../components/profile/MenuList';
import MultiplayerCard from '../components/profile/MultiplayerCard';

const ProfileScreen = ({ navigation }) => {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { user, profile, subscription, signOut, fetchProfile, checkSubscription } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({});
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Stats are now part of the profile object in authStore
    if (profile) {
      setStats({
        total: profile.total_attempted || 0,
        correct: profile.total_correct || 0,
        wrong: profile.total_wrong || 0,
        accuracy: profile.accuracy || 0,
        multiplayer: profile.multiplayer || { battlesPlayed: 0, wins: 0, rank: 'Novice' }
      });
    }
  }, [profile]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await Promise.all([
        fetchProfile(user.id),
        checkSubscription(user.id)
      ]);
    }
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await signOut();
    // Navigation listener in AppNavigator will handle redirection to Login
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />
        }
      >
        <ProfileHeader user={profile || { name: 'User', email: user?.email }} colors={colors} />
        
        <StatsCard stats={stats} colors={colors} />
        
        <SubscriptionCard sub={subscription || { status: 'none' }} colors={colors} />
        
        <MultiplayerCard stats={stats.multiplayer || {}} colors={colors} />
        
        <ActivityList history={history} colors={colors} />
        
        <MenuList 
          colors={colors} 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme} 
          onLogout={handleLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default ProfileScreen;


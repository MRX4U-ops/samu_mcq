import React, { useState, useEffect } from 'react';
import { 
  View, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, 
  RefreshControl, Text, TouchableOpacity 
} from 'react-native';
import { Award, ChevronRight, BookOpen } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import useAuthStore from '../store/authStore';
import { supabase } from '../services/supabaseClient';

// Components
import ProfileHeader from '../components/profile/ProfileHeader';
import StatsCard from '../components/profile/StatsCard';
import SubscriptionCard from '../components/profile/SubscriptionCard';
import MenuList from '../components/profile/MenuList';
import MultiplayerCard from '../components/profile/MultiplayerCard';

const ProfileScreen = ({ navigation }) => {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { user, profile, subscription, signOut, fetchProfile, checkSubscription } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({});
  const [certs, setCerts] = useState([]);
  const [certsLoading, setCertsLoading] = useState(true);

  const name = profile?.full_name || user?.email?.split('@')[0] || 'Student';

  useEffect(() => {
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

  const fetchCertificates = async () => {
    if (!name) return;
    setCertsLoading(true);
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .ilike('student_name', name)
        .eq('revoked', false);

      if (!error && data) {
        setCerts(data);
      }
    } catch (err) {
      console.warn('Failed to load certificates on mobile profile:', err.message);
    } finally {
      setCertsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [name]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await Promise.all([
        fetchProfile(user.id),
        checkSubscription(user.id),
        fetchCertificates()
      ]);
    }
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await signOut();
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
        
        {/* Certificates Section */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
            <Award size={18} color="#F59E0B" style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>My Certificates</Text>
            <View style={[styles.activePill, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.activePillText}>{certs.length} Earned</Text>
            </View>
          </View>

          {certsLoading ? (
            <ActivityIndicator size="small" color="#F59E0B" style={{ marginVertical: 10 }} />
          ) : certs.length === 0 ? (
            <Text style={[styles.noCertsText, { color: colors.textSecondary }]}>
              No certificates earned yet. Achieve 98% or higher in coursework exams to unlock official certificates.
            </Text>
          ) : (
            <View style={styles.certList}>
              {certs.map(c => (
                <TouchableOpacity 
                  key={c.id} 
                  style={[styles.certItem, { borderColor: colors.border }]}
                  onPress={() => navigation.navigate('CertificateView', { cert: c })}
                >
                  <View style={styles.certLeft}>
                    <View style={styles.certIconBox}>
                      <Award size={20} color="#F59E0B" />
                    </View>
                    <View style={styles.certInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.certSubName, { color: colors.text }]}>{c.subject_name}</Text>
                        <View style={styles.certScoreBadge}>
                          <Text style={styles.certScoreText}>{c.score}%</Text>
                        </View>
                      </View>
                      <Text style={[styles.certMetaLine, { color: colors.textSecondary }]}>
                        {c.achievement_level} · {c.completion_date}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D97706',
    textTransform: 'uppercase',
  },
  noCertsText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginVertical: 10,
  },
  certList: {
    flexDirection: 'column',
    gap: 10,
  },
  certItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.02)',
  },
  certLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  certIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  certInfo: {
    flex: 1,
  },
  certSubName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  certScoreBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  certScoreText: {
    color: '#065F46',
    fontSize: 10,
    fontWeight: 'bold',
  },
  certMetaLine: {
    fontSize: 11,
    marginTop: 2,
  }
});

export default ProfileScreen;

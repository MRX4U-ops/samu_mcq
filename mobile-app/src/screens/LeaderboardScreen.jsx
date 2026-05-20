import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StatusBar,
  Dimensions,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Trophy, Filter } from 'lucide-react-native';
import { supabase } from '../services/supabaseClient';
import { useTheme } from '../context/ThemeContext';
import useAuthStore from '../store/authStore';

// Premium Components
import TopThreeCards from '../components/leaderboard/TopThreeCards';
import LeaderboardRow from '../components/leaderboard/LeaderboardRow';
import BadgeSection from '../components/leaderboard/BadgeSection';
import StickyRankCard from '../components/leaderboard/StickyRankCard';
import ResetAnimation from '../components/leaderboard/ResetAnimation';

const { width } = Dimensions.get('window');

const LeaderboardScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuthStore();
  
  const [period, setPeriod] = useState('daily'); // 'daily', 'weekly', 'monthly', 'global'
  const [leaderboard, setLeaderboard] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [userRank, setUserRank] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [topTenMinScore, setTopTenMinScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserBadges = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_badges')
      .select('badges(*)')
      .eq('user_id', user.id);
    
    if (data) setUserBadges(data.map(item => item.badges));
  };

  const loadData = useCallback(async () => {
    try {
      const table = period === 'global' ? 'leaderboard_daily' : `leaderboard_${period}`;
      
      // 1. Fetch Top 50 with trend info
      // In a real app, we'd join with snapshots. For now, we simulate trends.
      const { data, error } = await supabase
        .from(table)
        .select(`
          points,
          last_updated,
          user_id,
          profiles (
            username,
            avatar_url
          )
        `)
        .order('points', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transform data for UI
      const mappedData = (data || []).map((item, idx) => ({
        user_id: item.user_id,
        username: item.profiles?.username || 'Anonymous',
        avatar_url: item.profiles?.avatar_url,
        points: item.points,
        trend: idx % 5 === 0 ? 'up' : idx % 7 === 0 ? 'down' : 'neutral', // Mock trends
        current_streak: Math.floor(Math.random() * 10) // Mock streaks for UI demo
      }));

      setLeaderboard(mappedData);

      // 2. Get Top 10 target score
      if (mappedData.length >= 10) {
        setTopTenMinScore(mappedData[9].points);
      } else {
        setTopTenMinScore(500); 
      }

      // 3. Current User Stats
      const me = mappedData.find(item => item.user_id === user?.id);
      if (me) {
        setUserPoints(me.points);
        setUserRank(mappedData.indexOf(me) + 1);
      } else {
        setUserPoints(0);
        setUserRank(0);
      }
    } catch (err) {
      console.error('[Leaderboard] Load error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period, user]);

  useEffect(() => {
    loadData();
    fetchUserBadges();
    
    const table = period === 'global' ? 'leaderboard_daily' : `leaderboard_${period}`;
    const channel = supabase
      .channel('leaderboard-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: table }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [period, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Global Rankings</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabBar, { backgroundColor: colors.surface }]}>
        {['daily', 'weekly', 'monthly', 'global'].map((p) => (
          <TouchableOpacity 
            key={p} 
            onPress={() => setPeriod(p)}
            style={[styles.tab, period === p && { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.tabText, period === p ? { color: '#FFF' } : { color: colors.textSecondary }]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ResetAnimation />
      
      {renderHeader()}

      <FlatList
        data={leaderboard.slice(3)}
        keyExtractor={(item) => item.user_id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        ListHeaderComponent={
          <>
            <TopThreeCards topThree={leaderboard.slice(0, 3)} />
            <BadgeSection userBadges={userBadges} colors={colors} />
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>TOP PERFORMERS</Text>
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <LeaderboardRow 
            item={item} 
            rank={index + 4} 
            colors={colors} 
            isCurrentUser={item.user_id === user?.id} 
          />
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Trophy size={60} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No entries yet</Text>
              <Text style={styles.emptySub}>Be the first to score points today!</Text>
            </View>
          )
        }
        contentContainerStyle={styles.scrollContent}
      />

      {!loading && (
        <StickyRankCard 
          userRank={userRank}
          userPoints={userPoints}
          topTenMinScore={topTenMinScore}
          colors={colors}
          isDarkMode={isDarkMode}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  filterBtn: { padding: 8, borderRadius: 12, backgroundColor: '#F1F5F9' },
  tabBar: { flexDirection: 'row', borderRadius: 16, padding: 5, elevation: 2, shadowOpacity: 0.05 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabText: { fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase' },
  scrollContent: { paddingBottom: 120 },
  listHeader: { paddingHorizontal: 20, marginBottom: 10 },
  listHeaderText: { fontSize: 11, fontWeight: '900', color: '#94A3B8', letterSpacing: 1.5 },
  emptyBox: { alignItems: 'center', marginTop: 50 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 15 },
  emptySub: { fontSize: 14, color: '#94A3B8', marginTop: 5 }
});

export default LeaderboardScreen;

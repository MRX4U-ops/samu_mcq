import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Trophy, Home, RotateCcw, Award, CheckCircle, Shield } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBattleStore } from '../store/battleStore';

const { width } = Dimensions.get('window');

const BattleResultScreen = ({ navigation }) => {
  const { leaderboard, disconnect } = useBattleStore();

  const handleHome = () => {
    disconnect();
    navigation.navigate('Home');
  };

  const handleRematch = () => {
    disconnect();
    navigation.navigate('BattleHome');
  };

  // Safe standings accessor
  const standings = leaderboard && leaderboard.length > 0 ? leaderboard : [
    { userId: '1', name: 'Champion', score: 120 },
    { userId: '2', name: 'Challenger', score: 85 },
    { userId: '3', name: 'Contender', score: 50 }
  ];

  const getPodiumAvatarColor = (rank) => {
    if (rank === 1) return '#F59E0B'; // Gold
    if (rank === 2) return '#94A3B8'; // Silver
    return '#B45309'; // Bronze
  };

  const getPodiumBadgeColor = (rank) => {
    if (rank === 1) return ['#FBBF24', '#F59E0B'];
    if (rank === 2) return ['#CBD5E1', '#94A3B8'];
    return ['#D97706', '#B45309'];
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1E1B4B', '#2B0845']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Award size={56} color="#10B981" />
          <Text style={styles.headerTitle}>BATTLE RESULTS</Text>
          <Text style={styles.headerSubtitle}>The dust has settled in the arena!</Text>
        </View>

        {/* Podium Display (Top 3 Players) */}
        <View style={styles.podiumContainer}>
          {/* Rank 2 (Left) */}
          {standings[1] && (
            <View style={[styles.podiumColumn, { height: 130, marginTop: 40 }]}>
              <View style={[styles.podiumAvatar, { borderColor: getPodiumAvatarColor(2) }]}>
                <Text style={styles.avatarText}>{standings[1].name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>{standings[1].name}</Text>
              <LinearGradient
                colors={getPodiumBadgeColor(2)}
                style={styles.podiumPedestal}
              >
                <Text style={styles.pedestalRank}>2</Text>
                <Text style={styles.pedestalPoints}>{standings[1].score} pts</Text>
              </LinearGradient>
            </View>
          )}

          {/* Rank 1 (Center - Tallest) */}
          {standings[0] && (
            <View style={[styles.podiumColumn, { height: 170 }]}>
              <View style={styles.crownWrapper}>
                <Trophy size={28} color="#FBBF24" fill="#FBBF24" />
              </View>
              <View style={[styles.podiumAvatar, { borderColor: getPodiumAvatarColor(1), width: 72, height: 72, borderRadius: 36 }]}>
                <Text style={[styles.avatarText, { fontSize: 24 }]}>{standings[0].name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={[styles.podiumName, { fontWeight: '900' }]} numberOfLines={1}>{standings[0].name}</Text>
              <LinearGradient
                colors={getPodiumBadgeColor(1)}
                style={[styles.podiumPedestal, { height: 90 }]}
              >
                <Text style={styles.pedestalRank}>1</Text>
                <Text style={styles.pedestalPoints}>{standings[0].score} pts</Text>
              </LinearGradient>
            </View>
          )}

          {/* Rank 3 (Right) */}
          {standings[2] && (
            <View style={[styles.podiumColumn, { height: 110, marginTop: 60 }]}>
              <View style={[styles.podiumAvatar, { borderColor: getPodiumAvatarColor(3) }]}>
                <Text style={styles.avatarText}>{standings[2].name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>{standings[2].name}</Text>
              <LinearGradient
                colors={getPodiumBadgeColor(3)}
                style={styles.podiumPedestal}
              >
                <Text style={styles.pedestalRank}>3</Text>
                <Text style={styles.pedestalPoints}>{standings[2].score} pts</Text>
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Full Rankings Sheet */}
        <View style={styles.rankingsCard}>
          <View style={styles.cardHeader}>
             <Shield size={18} color="#6366F1" />
             <Text style={styles.cardTitle}>FINAL STANDINGS</Text>
          </View>

          {standings.map((player, index) => {
            const isTop3 = index < 3;
            return (
              <View key={player.userId || index} style={styles.rankRow}>
                <View style={[
                  styles.rankBadge, 
                  isTop3 && { backgroundColor: getPodiumAvatarColor(index + 1) }
                ]}>
                  <Text style={[styles.rankText, isTop3 && { color: '#FFF' }]}>{index + 1}</Text>
                </View>
                
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerSubtext}>
                    Accuracy: {player.accuracy !== undefined ? `${player.accuracy.toFixed(0)}%` : '80%'}
                  </Text>
                </View>

                <Text style={styles.playerScore}>{player.score} pts</Text>
              </View>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsBox}>
          <TouchableOpacity style={styles.rematchBtn} onPress={handleRematch}>
            <RotateCcw size={20} color="#FFF" />
            <Text style={styles.rematchText}>New Match</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeBtn} onPress={handleHome}>
            <Home size={20} color="#6366F1" />
            <Text style={styles.homeText}>Main Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, alignItems: 'center', paddingBottom: 60 },
  header: { alignItems: 'center', marginVertical: 20 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: 2, marginTop: 12 },
  headerSubtitle: { fontSize: 13, color: '#A5B4FC', marginTop: 4, fontWeight: '600' },
  podiumContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'flex-end', 
    width: '100%', 
    height: 280, 
    marginVertical: 20,
    paddingHorizontal: 10
  },
  podiumColumn: { alignItems: 'center', width: (width - 68) / 3 },
  podiumAvatar: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: 'rgba(255,255,255,0.06)', 
    borderWidth: 2, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 8
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  podiumName: { color: '#FFF', fontSize: 13, fontWeight: 'bold', marginBottom: 6 },
  podiumPedestal: { 
    width: '100%', 
    height: 70, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingVertical: 10
  },
  pedestalRank: { fontSize: 26, fontWeight: '900', color: '#FFF' },
  pedestalPoints: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 'bold', marginTop: 2 },
  crownWrapper: { marginBottom: 4, transform: [{ rotate: '0deg' }] },
  rankingsCard: { 
    backgroundColor: '#FFF', 
    width: '100%', 
    borderRadius: 28, 
    padding: 24, 
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  cardTitle: { fontSize: 14, fontWeight: '900', color: '#1E1B4B', letterSpacing: 1, marginLeft: 8 },
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  rankBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  rankText: { fontSize: 12, fontWeight: 'bold', color: '#6366F1' },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  playerSubtext: { fontSize: 11, color: '#6B7280', marginTop: 2, fontWeight: '500' },
  playerScore: { fontSize: 16, fontWeight: '900', color: '#6366F1' },
  actionsBox: { width: '100%', marginTop: 30, gap: 14 },
  rematchBtn: { 
    backgroundColor: '#10B981', 
    height: 56, 
    borderRadius: 16, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3
  },
  rematchText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  homeBtn: { 
    backgroundColor: '#FFF', 
    height: 56, 
    borderRadius: 16, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#6366F1'
  },
  homeText: { color: '#6366F1', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});

export default BattleResultScreen;

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { ArrowLeft, Users, Play, Copy, Share2 } from 'lucide-react-native';
import { useBattleStore } from '../store/battleStore';

const LobbyScreen = ({ navigation }) => {
  const { roomCode, participants, status, isHost, startGame, setReady } = useBattleStore();

  useEffect(() => {
    if (status === 'live') {
      navigation.navigate('LiveBattle');
    }
  }, [status, navigation]);

  const handleStartBattle = () => {
    if (isHost) {
      startGame();
    } else {
      setReady(true); // Toggle ready
    }
  };

  const { myUserId } = useBattleStore();
  const isMeReady = participants.find(p => p.userId === myUserId)?.ready;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Battle Lobby</Text>
      </View>

      <View style={styles.codeSection}>
        <Text style={styles.codeLabel}>ROOM CODE</Text>
        <View style={styles.codeContainer}>
          <Text style={styles.codeText}>{roomCode}</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Copy size={20} color="#6366F1" />
          </TouchableOpacity>
        </View>
        <Text style={styles.codeDesc}>Share this code with up to 15 friends to join</Text>
      </View>

      <View style={styles.playerSection}>
        <View style={styles.sectionHeader}>
          <Users size={20} color="#4B5563" />
          <Text style={styles.sectionTitle}>Players Joined ({participants.length}/16)</Text>
        </View>

        <FlatList
          data={participants}
          keyExtractor={(item, index) => item.userId || index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.playerCard}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
              </View>
              <Text style={styles.playerName}>{item.name}</Text>
              {index === 0 && (
                <View style={styles.hostBadge}>
                  <Text style={styles.hostBadgeText}>HOST</Text>
                </View>
              )}
              {item.ready && (
                <View style={[styles.hostBadge, { backgroundColor: '#10B981', marginLeft: 5 }]}>
                  <Text style={styles.hostBadgeText}>READY</Text>
                </View>
              )}
            </View>
          )}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.startButton, (!isHost && isMeReady) ? {backgroundColor: '#10B981'} : {}]} 
          onPress={handleStartBattle}
        >
          {isHost ? (
            <>
              <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.startButtonText}>Start Battle</Text>
            </>
          ) : (
            <Text style={styles.startButtonText}>{isMeReady ? 'Ready!' : 'Click to Ready'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginLeft: 15 },
  codeSection: { padding: 30, alignItems: 'center', backgroundColor: '#FFFFFF', marginBottom: 10 },
  codeLabel: { fontSize: 12, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1, marginBottom: 10 },
  codeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingVertical: 15, paddingHorizontal: 25, borderRadius: 20, borderWidth: 2, borderColor: '#6366F1' },
  codeText: { fontSize: 32, fontWeight: 'bold', color: '#6366F1', marginRight: 15, letterSpacing: 2 },
  codeDesc: { fontSize: 13, color: '#6B7280', marginTop: 15 },
  playerSection: { flex: 1, padding: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginLeft: 10 },
  playerCard: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 1 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#6366F1' },
  playerName: { fontSize: 16, fontWeight: '600', color: '#374151', flex: 1 },
  hostBadge: { backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  hostBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  footer: { padding: 20, backgroundColor: '#FFFFFF' },
  startButton: { backgroundColor: '#6366F1', height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  startButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});

export default LobbyScreen;

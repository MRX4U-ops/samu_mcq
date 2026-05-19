import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { ArrowLeft, Users, Play, Copy, CheckCircle, Crown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { useBattleStore } from '../store/battleStore';

const BattleLobbyScreen = ({ navigation }) => {
  const { roomCode, participants, status, isHost, startGame, setReady, myUserId, disconnect, error } = useBattleStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === 'live') {
      navigation.replace('LiveBattle');
    }
  }, [status]);

  useEffect(() => {
    if (error) {
      Alert.alert('Battle Error', error);
      useBattleStore.setState({ error: null });
    }
  }, [error]);

  const handleCopy = async () => {
    if (roomCode) {
      try {
        await Clipboard.setStringAsync(roomCode);
      } catch (err) {
        try {
          const { Clipboard: RNClipboard } = require('react-native');
          RNClipboard.setString(roomCode);
        } catch (rnErr) {
          console.warn("Clipboard not available", rnErr);
        }
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isMeReady = participants.find(p => p.userId === myUserId)?.ready;

  const handleAction = () => {
    if (isHost) {
      if (participants.length < 2) {
        Alert.alert(
          "Waiting for Players",
          "You need at least 2 players to start a quiz battle. Share the room code with your friends!",
          [{ text: "OK" }]
        );
        return;
      }
      startGame();
    } else {
      setReady(!isMeReady);
    }
  };

  const handleBack = () => {
    disconnect();
    navigation.replace('BattleHome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1E1B4B', '#23083B']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Battle Lobby</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.codeSection}>
        <Text style={styles.codeLabel}>ROOM CODE</Text>
        <View style={styles.codeContainer}>
          <Text style={styles.codeText}>{roomCode}</Text>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
            <Copy size={20} color="#10B981" />
          </TouchableOpacity>
        </View>
        <Text style={styles.codeDesc}>
          {copied ? "Code Copied to Clipboard! 🎉" : "Share this code with friends to join"}
        </Text>
      </View>

      <View style={styles.playerSection}>
        <View style={styles.sectionHeader}>
          <Users size={20} color="#C7D2FE" />
          <Text style={styles.sectionTitle}>Combatants ({participants.length}/16)</Text>
        </View>

        <FlatList
          data={participants}
          keyExtractor={(item) => item.userId}
          renderItem={({ item, index }) => {
            const isHostUser = index === 0;
            return (
              <View style={styles.playerCard}>
                <View style={styles.playerAvatar}>
                  <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                
                <Text style={styles.playerName}>{item.name}</Text>
                
                {isHostUser ? (
                  <View style={styles.hostBadge}>
                    <Crown size={12} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={styles.badgeText}>HOST</Text>
                  </View>
                ) : item.ready ? (
                  <View style={[styles.hostBadge, { backgroundColor: '#10B981' }]}>
                    <CheckCircle size={12} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={styles.badgeText}>READY</Text>
                  </View>
                ) : (
                  <View style={[styles.hostBadge, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                    <Text style={[styles.badgeText, { color: '#A5B4FC' }]}>WAITING</Text>
                  </View>
                )}
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            isHost ? { backgroundColor: '#10B981' } : isMeReady ? { backgroundColor: '#F59E0B' } : { backgroundColor: '#6366F1' }
          ]} 
          onPress={handleAction}
          activeOpacity={0.8}
        >
          {isHost ? (
            <>
              <Play size={20} color="#FFF" fill="#FFF" />
              <Text style={styles.actionButtonText}>Start Match</Text>
            </>
          ) : (
            <Text style={styles.actionButtonText}>
              {isMeReady ? 'Cancel Ready' : 'Lock Ready'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  backButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  codeSection: { padding: 30, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  codeLabel: { fontSize: 12, fontWeight: 'bold', color: '#A5B4FC', letterSpacing: 1.5, marginBottom: 10 },
  codeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
    paddingVertical: 15, 
    paddingHorizontal: 25, 
    borderRadius: 20, 
    borderWidth: 2, 
    borderColor: '#10B981' 
  },
  codeText: { fontSize: 32, fontWeight: 'bold', color: '#10B981', marginRight: 15, letterSpacing: 3 },
  copyButton: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: 'rgba(16, 185, 129, 0.15)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  codeDesc: { fontSize: 13, color: '#C7D2FE', marginTop: 15, fontWeight: '500' },
  playerSection: { flex: 1, padding: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginLeft: 10 },
  playerCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 12, 
    elevation: 2 
  },
  playerAvatar: { 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    backgroundColor: '#6366F1', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15 
  },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  playerName: { fontSize: 16, fontWeight: '600', color: '#FFF', flex: 1 },
  hostBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 10 
  },
  badgeText: { fontSize: 10, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  footer: { padding: 24 },
  actionButton: { 
    height: 56, 
    borderRadius: 16, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  actionButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});

export default BattleLobbyScreen;

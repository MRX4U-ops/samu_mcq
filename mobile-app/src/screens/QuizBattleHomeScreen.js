import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { ArrowLeft, Trophy, Sword, Users, Info, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBattleStore } from '../store/battleStore';
import useAuthStore from '../store/authStore';
import useSubscriptionStore from '../store/subscriptionStore';

const { width } = Dimensions.get('window');

const QuizBattleHomeScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const { fetchSubscriptionStatus } = useSubscriptionStore();
  const { initSocket, disconnect } = useBattleStore();

  useEffect(() => {
    const checkAccess = async () => {
      if (user) {
        const sub = await fetchSubscriptionStatus(user.id);
        if (!sub) {
          Alert.alert(
            "Premium Required",
            "Multiplayer Battles are only available to Premium members. Please subscribe to enter the arena.",
            [{ text: "View Plans", onPress: () => navigation.navigate('Subscription') }]
          );
          navigation.goBack();
          return;
        }
      }
      initSocket();
    };
    checkAccess();

    return () => {
      // Don't disconnect here in case we are navigating forward into lobby!
    };
  }, []);

  const handleBack = () => {
    disconnect();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1E1B4B', '#311042']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Battle Arena</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.trophyWrapper}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={styles.trophyGradient}
            >
              <Trophy size={48} color="#FFF" />
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>SAMU MULTIPLAYER</Text>
          <Text style={styles.heroSubtitle}>Real-time clinical MCQ showdowns</Text>
        </View>

        <View style={styles.deck}>
          {/* HOST A ROOM */}
          <TouchableOpacity 
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CreateBattle')}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <Sword size={32} color="#FFF" />
                <View style={styles.badge}><Text style={styles.badgeText}>HOST</Text></View>
              </View>
              <Text style={styles.cardTitle}>Host a Battle</Text>
              <Text style={styles.cardDesc}>Select a specific Course, Subject, and Topic to challenge your peers.</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* JOIN A ROOM */}
          <TouchableOpacity 
            activeOpacity={0.85}
            onPress={() => navigation.navigate('JoinBattle')}
            style={{ marginTop: 20 }}
          >
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <Users size={32} color="#FFF" />
                <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}><Text style={styles.badgeText}>JOIN</Text></View>
              </View>
              <Text style={styles.cardTitle}>Join with Room Code</Text>
              <Text style={styles.cardDesc}>Enter a 6-character room code to instantly connect and play with friends.</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.footerTip}>
          <ShieldCheck size={18} color="#A5B4FC" />
          <Text style={styles.tipText}>Scores are synced to the weekly leaderboards!</Text>
        </View>
      </ScrollView>
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
  scrollContent: { padding: 24, alignItems: 'center' },
  heroSection: { alignItems: 'center', marginVertical: 30 },
  trophyWrapper: { 
    width: 96, 
    height: 96, 
    borderRadius: 48, 
    padding: 3, 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 16
  },
  trophyGradient: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 48, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  heroTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: 1.5 },
  heroSubtitle: { fontSize: 14, color: '#A5B4FC', marginTop: 6, fontWeight: '500' },
  deck: { width: '100%', marginTop: 10 },
  card: { 
    borderRadius: 24, 
    padding: 24, 
    elevation: 8, 
    shadowColor: '#000', 
    shadowOpacity: 0.25, 
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  badge: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  cardDesc: { fontSize: 13, color: '#E0E7FF', lineHeight: 18, opacity: 0.9 },
  footerTip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 40, 
    backgroundColor: 'rgba(99, 102, 241, 0.1)', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)'
  },
  tipText: { color: '#C7D2FE', fontSize: 12, marginLeft: 8, fontWeight: '600' }
});

export default QuizBattleHomeScreen;

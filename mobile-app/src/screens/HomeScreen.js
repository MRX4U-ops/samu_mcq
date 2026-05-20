import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Bell, Lock, Unlock, Swords, Trophy, Timer, Camera, HelpCircle, Plane, User, BookOpen, Sparkles, ChevronRight, Globe, CircleCheck, Youtube, Flame, GraduationCap } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config/Constants';
import TopHeader from '../components/TopHeader';
import useAuthStore from '../store/authStore';
import useSubscriptionStore from '../store/subscriptionStore';
import OfferPopup from '../components/OfferPopup';
import { supabase } from '../services/supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuthStore();
  const { subscription, checkSubscription, offerPopupShown, setOfferPopupShown } = useAuthStore();
  const [isOfferVisible, setIsOfferVisible] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [showGreeting, setShowGreeting] = useState(false);
  const [quote, setQuote] = useState('');

  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (user) {
      checkSubscription(user.id);
      fetchStreak();
      
      // Dynamic, varied greetings for peak medical student motivation!
      const hour = new Date().getHours();
      const name = user.name || 'Scholar';
      let greetingPool = [];

      if (hour < 12) {
        greetingPool = [
          `Rise and shine, ${name}! Ready to conquer some MCQs?`,
          `Good morning, ${name}! A new day to excel in your medical studies.`,
          `Hello ${name}! Let's start the day with a sharp practice session.`,
          `Top of the morning, ${name}! Your stethoscope and quizzes are waiting.`,
          `Start fresh today, ${name}! Focus brings true clinical mastery.`
        ];
      } else if (hour < 18) {
        greetingPool = [
          `Good afternoon, ${name}! Halfway through the day—keep pushing!`,
          `Hello ${name}! Ready for a quick, focused clinical study session?`,
          `Hope your day is productive, ${name}! Let's crack some tough cases.`,
          `Good afternoon, ${name}! Stay sharp, you are doing absolutely great.`,
          `Mid-day power session, ${name}! Let's boost your memory retention.`
        ];
      } else {
        greetingPool = [
          `Good evening, ${name}! Unwind and test your knowledge.`,
          `Hello ${name}! Ready to review your study topics tonight?`,
          `Great to see you, ${name}! A perfect time for a quick quiz battle.`,
          `Good evening, ${name}! Keep the momentum going!`,
          `Evening check-in, ${name}! Let's do a quick round of active recall.`
        ];
      }

      const randomGreeting = greetingPool[Math.floor(Math.random() * greetingPool.length)];
      setGreeting(randomGreeting);
      setShowGreeting(true);
      
      // Set a random medical motivational quote
      const quotes = [
        "\"Wherever the art of Medicine is loved, there is also a love of Humanity.\" — Hippocrates",
        "\"The good physician treats the disease; the great physician treats the patient who has the disease.\" — William Osler",
        "\"Observation, Reason, Human Understanding, Courage; these make the physician.\" — Martin H. Fischer",
        "\"The clinic is your classroom. Every patient is a book to be read.\" — Clinical Maxim",
        "\"Wear your white coat with pride, dignity, and compassion.\" — Medical School Motto",
        "\"Study hard today, save lives tomorrow.\" — Student Inspiration",
        "\"Medicine is a science of uncertainty and an art of probability.\" — William Osler",
        "\"In the sickroom, ten cents' worth of human understanding is equal to ten dollars' worth of medical science.\" — Martin H. Fischer"
      ];
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      
      // Hide greeting overlay after 3.5 seconds (we still display the permanent welcome card)
      const timer = setTimeout(() => setShowGreeting(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const fetchStreak = async () => {
    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .single();
      
      if (data) setStreak(data.current_streak);
    } catch (e) {
      console.log("Streak fetch error");
    }
  };

  // Automatic subscription popup on first login is removed per user request.
  // The popup will only be shown manually when the user clicks 'Upgrade' or accesses locked modules.
  useEffect(() => {
    // Disabled auto-showing of subscription popup on first login.
  }, [subscription, offerPopupShown, user]);

  const getDaysRemaining = () => {
    if (!subscription?.end_date) return 0;
    const end = new Date(subscription.end_date);
    const now = new Date();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };
  
  // Initialize with fallback data to ensure courses are never 'missing'
  const [courses, setCourses] = useState([
    { id: '1', title: '1st Course', subjects: '21 subjects', color: '#3B82F6', num: '1' },
    { id: '2', title: '2nd Course', subjects: '24 subjects', color: '#8B5CF6', num: '2' },
    { id: '3', title: '3rd Course', subjects: '25 subjects', color: '#10B981', num: '3' },
    { id: '4', title: '4th Course', subjects: '23 subjects', color: '#F59E0B', num: '4' },
    { id: '5', title: '5th Course', subjects: '24 subjects', color: '#EF4444', num: '5' },
    { id: '6', title: '6th Course', subjects: '14 subjects', color: '#06B6D4', num: '6' },
  ]);

  const featureCards = [
    { title: 'Quiz Battle', sub: 'Multiplayer real-time', icon: Swords, color: '#8B5CF6', screen: 'BattleHome' },
    { title: 'Leaderboard', sub: 'Live arena rankings', icon: Trophy, color: '#F59E0B', screen: 'Leaderboard' },
    { title: 'Exam Results', sub: 'Biochemistry & more', icon: GraduationCap, color: '#0F172A', screen: 'ExamResults' },
    { title: 'Timer Set', sub: 'Daily & weekly goals', icon: Timer, color: '#0D9488', screen: 'TimerSet' },
    { title: 'Image Answer', sub: 'Photo → instant AI', icon: Camera, color: '#1D4ED8', screen: 'ImageAnswer' },
    { title: 'Help Desk', sub: 'AI guidance & support', icon: HelpCircle, color: '#B91C1C', screen: 'HelpDesk' },
    { title: 'App Guide', sub: 'How to use the app', icon: BookOpen, color: '#059669', screen: 'AppGuidelines' },
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_URL}/courses`);
        const data = await response.json();
        if (data && data.length > 0) {
          const colorsList = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];
          const mapped = data.slice(0, 6).map((c, idx) => ({
            id: c._id,
            title: c.title,
            subjects: `${c.subjectCount || 0} subjects`,
            color: colorsList[idx % colorsList.length],
            num: (idx + 1).toString()
          }));
          setCourses(mapped);
        }
      } catch (e) {
        console.log("Using local curriculum fallback.");
      }
    };
    fetchCourses();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F0F5F9' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />
      
      <TopHeader title="SAMU MCQs" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Gorgeous Welcome & Greeting Card */}
        <LinearGradient
          colors={['#1E1B4B', '#312E81', '#4F46E5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeCard}
        >
          <View style={styles.welcomeCardHeader}>
            <View>
              <Text style={styles.welcomeSubtitle}>{greeting || "Welcome Back, Doctor"}</Text>
              <Text style={styles.welcomeTitle}>{user?.name || 'Academic Scholar'}</Text>
            </View>
            <View style={styles.sparkleBadge}>
              <Sparkles size={20} color="#FBBF24" />
            </View>
          </View>
          
          <Text style={styles.quoteText}>{quote || "Study hard today, save lives tomorrow."}</Text>
          
          <View style={styles.welcomeDivider} />
          
          <View style={styles.welcomeStatsRow}>
            <View style={styles.welcomeStatItem}>
              <Flame size={16} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.welcomeStatText}>{streak} Day Streak</Text>
            </View>
            
            <View style={styles.welcomeStatItem}>
              <GraduationCap size={16} color="#60A5FA" />
              <Text style={styles.welcomeStatText}>
                {subscription ? "Premium Active" : "Free Plan"}
              </Text>
            </View>
          </View>

          <View style={styles.challengeBox}>
            <View style={styles.challengeIcon}>
              <Swords size={12} color="#FFF" />
            </View>
            <Text style={styles.challengeText}>
              Today's Challenge: Try a Master Topic mixed test with random questions!
            </Text>
          </View>
        </LinearGradient>

        {/* Daily MCQ Practice Streak Card for Premium Active Users */}
        {subscription && streak > 0 && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFF',
            marginHorizontal: 16,
            marginTop: 8,
            marginBottom: 4,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
            justifyContent: 'space-between',
            borderWidth: 1,
            borderColor: '#E2E8F0',
            elevation: 1,
            shadowColor: '#000',
            shadowOpacity: 0.02,
            shadowRadius: 4,
          }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 }}>DAILY MCQ STREAK</Text>
            <View style={[styles.streakBadge, { backgroundColor: '#FFFBEB', borderWidth: 0 }]}>
              <Flame size={16} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.streakText}>{streak} Days</Text>
            </View>
          </View>
        )}

        {/* Subscription Status Banner for Free Plan Users */}
        {!subscription && (
          <TouchableOpacity 
            style={[
              styles.subBanner, 
              { backgroundColor: '#FFFBEB', borderColor: '#F59E0B' }
            ]}
            onPress={() => navigation.navigate('Subscription')}
          >
            <View style={styles.subBannerLeft}>
              <View style={[styles.subIconBox, { backgroundColor: '#F59E0B' }]}>
                <Lock size={18} color="#FFF" />
              </View>
              <View>
                <Text style={[styles.subStatusText, { color: '#92400E' }]}>
                  FREE PLAN
                </Text>
                <Text style={styles.subDetailText}>
                  Unlock all clinical modules
                </Text>
              </View>
            </View>
            
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Flame size={16} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.streakText}>{streak}</Text>
              </View>
            )}

            <View style={styles.subActionBox}>
              <Text style={[styles.subActionText, { color: '#F59E0B' }]}>
                UPGRADE
              </Text>
              <ChevronRight size={16} color='#F59E0B' />
            </View>
          </TouchableOpacity>
        )}

        {/* ASK AI Card */}
        <TouchableOpacity 
          style={styles.aiCard}
          onPress={() => navigation.navigate('AskAI')}
        >
          <View style={styles.aiLeft}>
            <View style={styles.aiIconBox}>
              <Sparkles size={24} color="#FFF" />
            </View>
            <View>
              <Text style={styles.aiTitle}>ASK AI ASSISTANT</Text>
              <Text style={styles.aiSub}>Instant medical answers in English, Hinglish & Malayalam</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#6366F1" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>SELECT COURSE</Text>
        
        {/* Academic Grid */}
        <View style={styles.courseGrid}>
          {courses.map((course) => (
            <TouchableOpacity 
              key={course.id} 
              style={styles.courseCard}
              onPress={() => navigation.navigate('Subject', { courseId: course.id, title: course.title })}
            >
              <View style={styles.courseCardTop}>
                <View style={[styles.numIconBox, { backgroundColor: course.color }]}>
                  <Text style={styles.numIconText}>{course.num}</Text>
                </View>
                {subscription ? (
                  <Unlock size={16} color="#10B981" />
                ) : (
                  <Lock size={16} color="#FBBF24" />
                )}
              </View>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={[styles.courseSubTitle, { color: course.color }]}>{course.subjects}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Feature Action Cards */}
        <View style={styles.actionGrid}>
          {featureCards.map((card, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[styles.actionCard, { backgroundColor: card.color }]}
              onPress={() => navigation.navigate(card.screen)}
            >
              <View style={styles.actionIconBox}>
                <card.icon size={28} color="#FFF" />
              </View>
              <Text style={styles.actionTitle}>{card.title}</Text>
              <Text style={styles.actionSub}>{card.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Telegram Banner */}
        <TouchableOpacity 
          style={styles.telegramBox} 
          onPress={() => {
            Alert.alert(
              "Join Telegram Channel",
              "Choose which channel you'd like to join:",
              [
                { text: "Channel 1", onPress: () => Linking.openURL('https://t.me/+R_LRXjQh7PMxNzY9') },
                { text: "Channel 2", onPress: () => Linking.openURL('https://t.me/+g65BwxbSBixjNWU1') },
                { text: "Cancel", style: "cancel" }
              ]
            );
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Plane size={22} color="#FFF" />
            <Text style={styles.telegramLabel}>Join our Telegram channel</Text>
          </View>
          <Text style={styles.telegramArrow}>↗</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>App Version: 1.0.2-FINAL</Text>
        </View>
      </ScrollView>

      {/* Modern Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.barItem} onPress={() => navigation.navigate('WebsiteOption')}>
          <Globe size={24} color="#94A3B8" />
          <Text style={styles.barText}>SAMU WEB</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.barItem} onPress={() => navigation.navigate('WebView', { url: 'https://www.youtube.com/watch?v=7UjSfETuO3Y' })}>
          <Youtube size={24} color="#EF4444" />
          <Text style={styles.barText}>YOUTUBE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.barItem}>
          <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/619/619153.png' }} style={styles.barIconHome} />
          <Text style={styles.barTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.barItem} onPress={() => navigation.navigate('Profile')}>
          <User size={24} color="#3B82F6" />
          <Text style={styles.barText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <OfferPopup 
        visible={isOfferVisible && !subscription} 
        onClose={() => setIsOfferVisible(false)} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBrand: { fontSize: 18, fontWeight: '900', color: '#1E293B', letterSpacing: -0.5 },
  headerUser: { fontSize: 10, color: '#94A3B8', fontWeight: '800' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  ssCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  ssText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  aiCard: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  aiLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  aiIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  aiTitle: { fontSize: 16, fontWeight: '900', color: '#1E293B', letterSpacing: 0.5 },
  aiSub: { fontSize: 11, color: '#6366F1', fontWeight: '700', marginTop: 2, marginRight: 10 },
  scrollContent: { paddingBottom: 110, paddingTop: 10 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#94A3B8',
    marginLeft: 16,
    marginBottom: 10,
    letterSpacing: 1.2,
  },
  courseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  courseCard: {
    width: '46%',
    backgroundColor: '#FFF',
    margin: '2%',
    padding: 15,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  courseCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  numIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numIconText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  courseTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  courseSubTitle: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginTop: 15,
  },
  actionCard: {
    width: '46%',
    margin: '2%',
    padding: 18,
    borderRadius: 24,
    minHeight: 140,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  actionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  actionSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4, fontWeight: '600' },
  telegramBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0EA5E9',
    margin: 16,
    padding: 18,
    borderRadius: 16,
  },
  telegramLabel: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  telegramArrow: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: 25,
  },
  barItem: { alignItems: 'center' },
  barIconHome: { width: 24, height: 24, marginBottom: 4 },
  barTextActive: { fontSize: 11, color: '#E67E22', fontWeight: '800' },
  barText: { fontSize: 11, color: '#94A3B8', fontWeight: '700' },
  subBanner: {
    margin: 16,
    padding: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    marginTop: 5,
  },
  subBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subStatusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subDetailText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 2,
  },
  subActionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subActionText: {
    fontSize: 12,
    fontWeight: '900',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    elevation: 1,
  },
  streakText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  greetingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginTop: 10,
    gap: 10,
    elevation: 5,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    opacity: 0.5,
  },
  versionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  welcomeCard: {
    margin: 16,
    padding: 20,
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#312E81',
    shadowOpacity: 0.25,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
  },
  welcomeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    flexShrink: 1,
    marginRight: 8,
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '950',
    marginTop: 4,
  },
  sparkleBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteText: {
    color: '#E0E7FF',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  welcomeDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  welcomeStatsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  welcomeStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  welcomeStatText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  challengeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
  },
  challengeIcon: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeText: {
    color: '#FDE68A',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
});

export default HomeScreen;

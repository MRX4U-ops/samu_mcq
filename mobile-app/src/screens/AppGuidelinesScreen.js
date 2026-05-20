import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { ArrowLeft, BookOpen, UserCheck, GraduationCap, Swords, Sparkles, HelpCircle, Compass, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const AppGuidelinesScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const guideSections = [
    {
      title: '1. Getting Started & Account',
      icon: UserCheck,
      color: '#4F46E5',
      gradient: ['#EEF2FF', '#E0E7FF'],
      details: [
        'Create a new account or log in with your credentials.',
        'Access your Profile from the bottom tab to check account status.',
        'Active subscription or valid Promo Code is required for premium modules.',
        'Activate promo codes instantly inside the subscription page.'
      ]
    },
    {
      title: '2. Curriculum & Topics',
      icon: Compass,
      color: '#0891B2',
      gradient: ['#ECFEFF', '#CFFAFE'],
      details: [
        'Explore clinical subjects categorized from 1st Course to 6th Course.',
        'Each subject contains list of focused, high-yield clinical topics.',
        'Look for unlocked icons to verify active access to topics.'
      ]
    },
    {
      title: '3. Study Modes & MCQs',
      icon: GraduationCap,
      color: '#059669',
      gradient: ['#ECFDF5', '#D1FAE5'],
      details: [
        'Test Mode (Purple): Standard practice session showing all topic questions. Options are shuffled on every start.',
        'Case Tasks / Situational (Green): Real clinical cases. Tests reasoning with exactly 10 situational tasks per topic.',
        'Master Practice: Shuffled 50-MCQ mockup exam comprising questions from all topics in a subject.'
      ]
    },
    {
      title: '4. AI Study Assistant',
      icon: Sparkles,
      color: '#D97706',
      gradient: ['#FFFBEB', '#FEF3C7'],
      details: [
        'Ask AI: Type custom medical queries or copy complex symptoms/questions.',
        'Get immediate guidance in English, Hinglish, or Malayalam.',
        'Image Answer: Snap or upload a photo of any medical question/text to match it with database items using AI OCR.'
      ]
    },
    {
      title: '5. Quiz Battles (Multiplayer)',
      icon: Swords,
      color: '#DC2626',
      gradient: ['#FEF2F2', '#FEE2E2'],
      details: [
        'Go to Quiz Battle card from home to enter the multiplayer arena.',
        'Create a private lobby and share the code to challenge classmates.',
        'Join via lobby code and compete in real-time on identical MCQ sets.',
        'Check the Leaderboard to view national rankings.'
      ]
    },
    {
      title: '6. Support & Feedback',
      icon: HelpCircle,
      color: '#2563EB',
      gradient: ['#EFF6FF', '#DBEAFE'],
      details: [
        'For payment, content errors or technical issues, open a Support Ticket.',
        'Check support status or chat with assistants inside Help Desk.',
        'Join Telegram group channels directly from the Home Screen links.'
      ]
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />
      
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>App Guidelines</Text>
          <Text style={styles.headerSubtitle}>User Manual & Clinical Study Guide</Text>
        </View>
        <BookOpen size={24} color="#6366F1" style={styles.headerIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeTitle}>Welcome to SAMU MCQs!</Text>
          <Text style={styles.welcomeText}>
            This interactive platform is designed to help you master medical licensing exams and clinical diagnostics. Follow the guidelines below to maximize your study efficiency.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>HOW TO USE THE APP</Text>

        {/* Dynamic Premium Cards */}
        {guideSections.map((section, idx) => {
          const IconComponent = section.icon;
          return (
            <View key={idx} style={styles.guideCard}>
              <View style={[styles.cardHeader, { backgroundColor: section.gradient[0] }]}>
                <View style={[styles.iconBox, { backgroundColor: section.color }]}>
                  <IconComponent size={20} color="#FFF" />
                </View>
                <Text style={[styles.cardTitle, { color: '#0F172A' }]}>{section.title}</Text>
              </View>
              <View style={styles.cardBody}>
                {section.details.map((detail, dIdx) => (
                  <View key={dIdx} style={styles.bulletRow}>
                    <ChevronRight size={14} color={section.color} style={styles.bulletIcon} />
                    <Text style={styles.bulletText}>{detail}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        <View style={styles.footer}>
          <Text style={styles.footerText}>SAMU MCQs System Guide • Version 1.0.2-FINAL</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  headerIcon: { marginLeft: 8 },
  scrollContent: { padding: 20 },
  welcomeBanner: {
    backgroundColor: '#6366F1',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  welcomeTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  welcomeText: { fontSize: 14, color: '#E0E7FF', lineHeight: 22 },
  sectionHeader: { fontSize: 13, fontWeight: '800', color: '#475569', letterSpacing: 1.5, marginBottom: 16 },
  guideCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '800' },
  cardBody: { padding: 20 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  bulletIcon: { marginTop: 3, marginRight: 8, flexShrink: 0 },
  bulletText: { fontSize: 14, color: '#334155', lineHeight: 20, flex: 1 },
  footer: { marginTop: 16, marginBottom: 30, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#94A3B8', fontWeight: '500' }
});

export default AppGuidelinesScreen;

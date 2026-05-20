import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, RotateCcw, FastForward, Clock, Target, List, ChevronRight, BookOpen } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const ResultScreen = ({ route, navigation }) => {
  const { colors, isDarkMode } = useTheme();

  // ALL hooks must be at the top before ANY conditional return
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const resultData = route.params?.resultData || null;

  useEffect(() => {
    if (!resultData) return; // skip animation if no data
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true })
    ]).start();
  }, [resultData]);

  // Fallback screen if resultData is missing
  if (!resultData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text, fontSize: 16 }}>No result data found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#6366F1', fontSize: 16, fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const getPerformanceData = () => {
    const acc = resultData.accuracy ?? 0;
    if (acc >= 90) return { title: "Medical Genius!", msg: "You've mastered this clinical topic.", color: "#10B981", icon: "🏆" };
    if (acc >= 70) return { title: "Great Job!", msg: "Excellent clinical understanding.", color: "#6366F1", icon: "🌟" };
    if (acc >= 40) return { title: "Good Effort", msg: "Keep practicing to master the basics.", color: "#F59E0B", icon: "📖" };
    return { title: "Keep Learning", msg: "Review the rationales to improve.", color: "#EF4444", icon: "💪" };
  };

  const performance = getPerformanceData();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          
          {/* Top Score Header */}
          <View style={[styles.mainScoreCard, { backgroundColor: colors.surface }]}>
             <View style={[styles.scoreIconCircle, { backgroundColor: performance.color + '15' }]}>
                <Text style={{ fontSize: 40 }}>{performance.icon}</Text>
             </View>
             <Text style={[styles.performanceTitle, { color: performance.color }]}>{performance.title}</Text>
             <Text style={[styles.performanceMsg, { color: colors.textSecondary }]}>{performance.msg}</Text>

             <View style={styles.accuracyContainer}>
                <View style={[styles.accuracyDial, { borderColor: performance.color }]}>
                   <Text style={[styles.accuracyText, { color: performance.color }]}>{resultData.accuracy ?? 0}%</Text>
                   <Text style={styles.accuracySub}>Score</Text>
                </View>
             </View>

             <View style={styles.summaryBar}>
                <View style={styles.summaryItem}>
                   <Text style={{ fontSize: 18 }}>✅</Text>
                   <Text style={[styles.summaryVal, { color: '#10B981' }]}>{resultData.correct ?? 0}</Text>
                   <Text style={styles.summaryLabel}>Correct</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                   <Text style={{ fontSize: 18 }}>❌</Text>
                   <Text style={[styles.summaryVal, { color: '#EF4444' }]}>{resultData.wrong ?? 0}</Text>
                   <Text style={styles.summaryLabel}>Incorrect</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                   <Clock size={18} color="#6366F1" />
                   <Text style={[styles.summaryVal, { color: '#6366F1' }]}>{resultData.timeTaken ?? '0:00'}</Text>
                   <Text style={styles.summaryLabel}>Time</Text>
                </View>
             </View>
          </View>

          {/* Detailed Statistics */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Clinical Breakdown</Text>
          <View style={styles.statsGrid}>
             <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
                <Target size={20} color="#6366F1" />
                <View>
                   <Text style={styles.statBoxLabel}>Total MCQs</Text>
                   <Text style={[styles.statBoxVal, { color: colors.text }]}>{resultData.totalQuestions ?? 0}</Text>
                </View>
             </View>
             <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
                <List size={20} color="#8B5CF6" />
                <View>
                   <Text style={styles.statBoxLabel}>Attempted</Text>
                   <Text style={[styles.statBoxVal, { color: colors.text }]}>{resultData.attempted ?? 0}</Text>
                </View>
             </View>
             <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
                <FastForward size={20} color="#94A3B8" />
                <View>
                   <Text style={styles.statBoxLabel}>Skipped</Text>
                   <Text style={[styles.statBoxVal, { color: colors.text }]}>{resultData.skipped ?? 0}</Text>
                </View>
             </View>
             <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
                <Clock size={20} color="#EC4899" />
                <View>
                   <Text style={styles.statBoxLabel}>Topic</Text>
                   <Text style={[styles.statBoxVal, { color: colors.text }]} numberOfLines={1}>{resultData.topicName || 'General'}</Text>
                </View>
             </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.footerActions}>
             <TouchableOpacity 
               style={styles.primaryAction}
               onPress={() => navigation.navigate('Review', { questions: resultData.questions || [] })}
             >
                <Text style={styles.primaryActionText}>Review All Answers</Text>
                <ChevronRight size={20} color="#FFF" />
             </TouchableOpacity>

             {resultData.subjectId && resultData.subjectId !== 'general' && (
               <TouchableOpacity 
                 style={[styles.topicsAction, { backgroundColor: colors.surface }]}
                 onPress={() => {
                   navigation.navigate('Topic', { 
                     subjectId: resultData.subjectId,
                     title: resultData.subjectTitle || 'Topics',
                     courseTitle: resultData.courseTitle || 'Course'
                   });
                 }}
               >
                  <BookOpen size={20} color="#6366F1" />
                  <Text style={[styles.topicsActionText, { color: '#6366F1' }]}>Go to Topics</Text>
               </TouchableOpacity>
             )}

             <View style={styles.secondaryRow}>
                <TouchableOpacity 
                  style={[styles.secondaryAction, { backgroundColor: colors.surface }]}
                  onPress={() => navigation.goBack()}
                >
                   <RotateCcw size={20} color="#6366F1" />
                   <Text style={[styles.secondaryActionText, { color: colors.text }]}>Try Again</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.secondaryAction, { backgroundColor: colors.surface }]}
                  onPress={() => navigation.navigate('Home')}
                >
                   <Home size={20} color={colors.text} />
                   <Text style={[styles.secondaryActionText, { color: colors.text }]}>Home</Text>
                </TouchableOpacity>
             </View>
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  mainScoreCard: { borderRadius: 30, padding: 30, alignItems: 'center', marginBottom: 25, elevation: 5, shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  scoreIconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  performanceTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  performanceMsg: { fontSize: 14, textAlign: 'center', marginBottom: 25 },
  accuracyContainer: { marginBottom: 30 },
  accuracyDial: { width: 150, height: 150, borderRadius: 75, borderWidth: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  accuracyText: { fontSize: 42, fontWeight: '900' },
  accuracySub: { fontSize: 12, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase' },
  summaryBar: { flexDirection: 'row', width: '100%', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 25, justifyContent: 'space-between' },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryVal: { fontSize: 18, fontWeight: 'bold', marginVertical: 4 },
  summaryLabel: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase' },
  summaryDivider: { width: 1, height: 40, backgroundColor: '#F1F5F9' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginLeft: 5 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 30 },
  statBox: { width: '48%', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  statBoxLabel: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase' },
  statBoxVal: { fontSize: 16, fontWeight: 'bold' },
  footerActions: { gap: 12, marginBottom: 40 },
  primaryAction: { backgroundColor: '#6366F1', height: 65, borderRadius: 22, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  primaryActionText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  topicsAction: { height: 60, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, borderWidth: 2, borderColor: '#6366F1', marginTop: 4, marginBottom: 4 },
  topicsActionText: { fontSize: 16, fontWeight: 'bold' },
  secondaryRow: { flexDirection: 'row', gap: 12 },
  secondaryAction: { flex: 1, height: 60, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  secondaryActionText: { fontSize: 15, fontWeight: 'bold' }
});

export default ResultScreen;

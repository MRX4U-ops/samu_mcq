import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, BookOpen, GraduationCap, ClipboardList, Info, Star, Eye, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config/Constants';
import { MCQ_REPOSITORY } from '../data/mcqRepository';
import useAuthStore from '../store/authStore';

const TopicScreen = ({ route, navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const { subjectId, title, courseTitle, localSubjectId: passedLocalId } = route.params || { subjectId: 1, title: 'Medical Module', courseTitle: '1st Course' };
  const { subscription, profile } = useAuthStore();
  const isSubscribed = !!subscription || profile?.role === 'admin';
  
  // If subjectId is already a local key (s-1-10), use it; otherwise use the passedLocalId
  const localSubjectId = (subjectId && !subjectId.includes('-') || (subjectId && subjectId.startsWith('s-'))) 
    ? subjectId 
    : (passedLocalId || subjectId);
  
  const getQuestionCount = (topicId) => {
    let questions = null;
    // Search all subjects in the repository for this topicId
    for (const sKey in MCQ_REPOSITORY) {
      if (MCQ_REPOSITORY[sKey][topicId]) {
        questions = MCQ_REPOSITORY[sKey][topicId];
        break;
      }
    }

    let count = 0;
    if (questions) {
      if (Array.isArray(questions)) {
        count = questions.length;
      } else if (questions.test) {
        count = questions.test.length;
      } else if (questions.situational) {
        count = questions.situational.length;
      }
    }
    return count;
  };

  const getSituationalCount = (topicId) => {
    let questions = null;
    for (const sKey in MCQ_REPOSITORY) {
      if (MCQ_REPOSITORY[sKey][topicId]) {
        questions = MCQ_REPOSITORY[sKey][topicId];
        break;
      }
    }
    if (questions && questions.situational) {
      return questions.situational.length;
    }
    return 0;
  };
  let localTopics = [];
  if (localSubjectId === 's-1-10') {
    // s-1-10 starts at t-s-1-10-0
    localTopics = Array.from({ length: 12 }, (_, i) => ({ _id: `t-${localSubjectId}-${i}`, title: `Topic ${i + 1}`, localSubjectId }));
  } else if (localSubjectId === 's-1-11') {
    // s-1-11 starts at t-s-1-11-12
    localTopics = Array.from({ length: 12 }, (_, i) => ({ _id: `t-${localSubjectId}-${i + 12}`, title: `Topic ${i + 13}`, localSubjectId }));
  } else if (localSubjectId === 's-2-8') {
    // s-2-8 starts at t-s-2-8-1
    localTopics = Array.from({ length: 15 }, (_, i) => ({ _id: `t-${localSubjectId}-${i + 1}`, title: `Topic ${i + 1}`, localSubjectId }));
  } else if (localSubjectId === 's-2-1') {
    // Biochemistry Module 2: topics 16 to 30
    localTopics = Array.from({ length: 15 }, (_, i) => ({ _id: `t-${localSubjectId}-${i}`, title: `Topic ${i + 16}`, localSubjectId }));
  } else if (localSubjectId === 's-2-9') {
    // Microbiology, Virology, Parasitology and Immunology-1: 12 topics
    localTopics = Array.from({ length: 12 }, (_, i) => ({ _id: `t-${localSubjectId}-${i}`, title: `Topic ${i + 1}`, localSubjectId }));
  } else if (localSubjectId === 's-2-10') {
    // Microbiology, Virology, Parasitology and Immunology-2: Topic 13 to Topic 20 + Added Questions 1, 2, 3
    const mainTopics = Array.from({ length: 8 }, (_, i) => ({ _id: `t-${localSubjectId}-${i + 13}`, title: `Topic ${i + 13}`, localSubjectId }));
    const addedTopics = [
      { _id: `t-${localSubjectId}-21`, title: 'Added Question 1', localSubjectId },
      { _id: `t-${localSubjectId}-22`, title: 'Added Question 2', localSubjectId },
      { _id: `t-${localSubjectId}-23`, title: 'Added Question 3', localSubjectId }
    ];
    localTopics = [...mainTopics, ...addedTopics];
  } else {
    // Others (like Course 2) are generally 0-indexed: t-s-x-x-0
    localTopics = Array.from({ length: 15 }, (_, i) => ({ _id: `t-${localSubjectId}-${i}`, title: `Topic ${i + 1}`, localSubjectId }));
  }

  // Always append Master Topic
  localTopics.push({ 
    _id: `master-${localSubjectId}`, 
    title: "Master Topic (Comprehensive Review)", 
    isMaster: true,
    localSubjectId
  });

  const isMicroBio2 = localSubjectId === 's-2-10';
  const [showAdditional, setShowAdditional] = useState(false);

  // For Microbiology-2: hide Added Questions unless toggled
  const visibleTopics = isMicroBio2 && !showAdditional
    ? localTopics.filter(t => !t.title.startsWith('Added Question'))
    : localTopics;

  const [topics, setTopics] = useState(localTopics);
  const [loading, setLoading] = useState(false); // Instant access
  const [attemptsHistory, setAttemptsHistory] = useState({});
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      const loadHistory = async () => {
        try {
          const historyKey = 'samu_mcq_attempts_history';
          const historyStr = await AsyncStorage.getItem(historyKey);
          if (historyStr) {
            setAttemptsHistory(JSON.parse(historyStr));
          }
        } catch (e) {
          console.warn('[Attempts History] Load failed:', e.message);
        }
      };
      loadHistory();
    }
  }, [isFocused]);

  const handleTopicPress = (topic, mode) => {
    if (!isSubscribed) {
      Alert.alert(
        "Subscription Required",
        "Please subscribe to unlock access to all courses and content.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Subscribe Now", onPress: () => navigation.navigate('Subscription') }
        ]
      );
    } else {
      navigation.navigate('MCQ', { 
        topicId: topic._id, 
        title: topic.title, 
        mode: mode,
        subjectId: topic.localSubjectId || localSubjectId,
        subjectTitle: title,
        courseTitle: courseTitle
      });
    }
  };

  // NOTE: We intentionally do NOT fetch topics from the server.
  // The server returns UUID-based topic IDs that don't match our local repository.
  // All topics are served from the local MCQ_REPOSITORY for reliability.

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{courseTitle}</Text>
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
          <Text style={styles.subtitle}>Select clinical modality</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Accessing Subject Repository...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {isMicroBio2 && (
            <TouchableOpacity
              onPress={() => setShowAdditional(prev => !prev)}
              style={{
                marginHorizontal: 16,
                marginBottom: 10,
                marginTop: 4,
                backgroundColor: showAdditional ? '#FEF3C7' : '#F0FDF4',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: showAdditional ? '#F59E0B' : '#10B981',
              }}
            >
              <Eye size={18} color={showAdditional ? '#D97706' : '#059669'} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: showAdditional ? '#D97706' : '#059669' }}>
                {showAdditional ? 'Hide Added Questions (3)' : 'Show Added Questions (3)'}
              </Text>
            </TouchableOpacity>
          )}
          {visibleTopics.length > 0 ? visibleTopics.map((topic, index) => {
            const isMaster = topic.isMaster || (topic._id && topic._id.startsWith('master-'));
            
            const attemptsTest = attemptsHistory[`${topic._id}_test`] || [];
            const attemptsSituational = attemptsHistory[`${topic._id}_situational`] || [];
            const hasAnyAttempts = attemptsTest.length > 0 || attemptsSituational.length > 0;
            
            return (
              <View key={topic._id} style={[styles.topicSection, { backgroundColor: colors.surface }]}>
                <View style={styles.topicHeader}>
                  <View style={[styles.numberBadge, isMaster && { backgroundColor: '#FFF7ED' }]}>
                    {!isSubscribed ? (
                      <Lock size={18} color="#EF4444" />
                    ) : isMaster ? (
                      <Star size={18} color="#F97316" fill="#F97316" />
                    ) : (
                      <Text style={styles.numberText}>{index + 1}</Text>
                    )}
                  </View>
                  <Text style={[
                    styles.topicTitle, 
                    { color: colors.text },
                    isMaster && { color: '#C2410C', fontWeight: '900' }
                  ]}>
                    {topic.title}
                  </Text>
                </View>
                
                <View style={styles.buttonRow}>
                  {isMaster ? (
                    <TouchableOpacity 
                      style={{ flex: 1 }}
                      onPress={() => handleTopicPress(topic, 'test')}
                    >
                      <LinearGradient
                        colors={['#EF4444', '#F59E0B', '#10B981']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.typeButton, { flex: 1 }]}
                      >
                        <GraduationCap size={20} color="#FFF" />
                        <Text style={[styles.typeButtonText, { fontSize: 16 }]}>MASTER PRACTICE (50 MCQs)</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity 
                        style={[styles.typeButton, { backgroundColor: '#6366F1' }]}
                        onPress={() => handleTopicPress(topic, 'test')}
                      >
                        <ClipboardList size={18} color="#FFF" />
                        <Text style={styles.typeButtonText}>{getQuestionCount(topic._id) || 'XX'} Questions</Text>
                      </TouchableOpacity>
       
                      <TouchableOpacity 
                        style={[styles.typeButton, { backgroundColor: '#10B981' }]}
                        onPress={() => handleTopicPress(topic, 'situational')}
                      >
                        <GraduationCap size={18} color="#FFF" />
                        <Text style={styles.typeButtonText}>{getSituationalCount(topic._id) || '0'} Case Tasks</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                {hasAnyAttempts && (
                  <View style={[styles.historySection, { borderTopColor: isDarkMode ? '#374151' : '#F1F5F9' }]}>
                    <Text style={[styles.historySectionTitle, { color: colors.textSecondary }]}>Last 3 Attempts</Text>
                    {attemptsTest.length > 0 && (
                      <View style={styles.historyRow}>
                        <Text style={[styles.historyLabel, { color: colors.textSecondary }]}>Questions:</Text>
                        <View style={styles.historyPillsContainer}>
                          {attemptsTest.map((attempt, idx) => {
                            const acc = attempt.accuracy ?? 0;
                            let badgeBg = '#FEF2F2';
                            let badgeText = '#EF4444';
                            if (acc >= 90) {
                              badgeBg = '#ECFDF5';
                              badgeText = '#10B981';
                            } else if (acc >= 70) {
                              badgeBg = '#EEF2FF';
                              badgeText = '#6366F1';
                            } else if (acc >= 40) {
                              badgeBg = '#FFFBEB';
                              badgeText = '#F59E0B';
                            }
                            
                            let dateStr = '';
                            if (attempt.date) {
                              const d = new Date(attempt.date);
                              dateStr = ` (${d.getDate()}/${d.getMonth() + 1})`;
                            }
                            
                            return (
                              <TouchableOpacity 
                                key={idx} 
                                style={[styles.historyBadge, { backgroundColor: badgeBg, flexDirection: 'row', alignItems: 'center', gap: 4 }]}
                                onPress={() => {
                                  if (attempt.questions && attempt.questions.length > 0) {
                                    navigation.navigate('Review', { questions: attempt.questions });
                                  } else {
                                    Alert.alert(
                                      "No Review Data",
                                      "Detailed question history is not available for this attempt."
                                    );
                                  }
                                }}
                              >
                                <Text style={[styles.historyBadgeText, { color: badgeText }]}>
                                  {attempt.correct}/{attempt.total}{dateStr}
                                </Text>
                                <Eye size={12} color={badgeText} />
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    )}
                    
                    {!isMaster && attemptsSituational.length > 0 && (
                      <View style={styles.historyRow}>
                        <Text style={[styles.historyLabel, { color: colors.textSecondary }]}>Case Tasks:</Text>
                        <View style={styles.historyPillsContainer}>
                          {attemptsSituational.map((attempt, idx) => {
                            const acc = attempt.accuracy ?? 0;
                            let badgeBg = '#FEF2F2';
                            let badgeText = '#EF4444';
                            if (acc >= 90) {
                              badgeBg = '#ECFDF5';
                              badgeText = '#10B981';
                            } else if (acc >= 70) {
                              badgeBg = '#EEF2FF';
                              badgeText = '#6366F1';
                            } else if (acc >= 40) {
                              badgeBg = '#FFFBEB';
                              badgeText = '#F59E0B';
                            }
                            
                            let dateStr = '';
                            if (attempt.date) {
                              const d = new Date(attempt.date);
                              dateStr = ` (${d.getDate()}/${d.getMonth() + 1})`;
                            }
                            
                            return (
                              <TouchableOpacity 
                                key={idx} 
                                style={[styles.historyBadge, { backgroundColor: badgeBg, flexDirection: 'row', alignItems: 'center', gap: 4 }]}
                                onPress={() => {
                                  if (attempt.questions && attempt.questions.length > 0) {
                                    navigation.navigate('Review', { questions: attempt.questions });
                                  } else {
                                    Alert.alert(
                                      "No Review Data",
                                      "Detailed question history is not available for this attempt."
                                    );
                                  }
                                }}
                              >
                                <Text style={[styles.historyBadgeText, { color: badgeText }]}>
                                  {attempt.correct}/{attempt.total}{dateStr}
                                </Text>
                                <Eye size={12} color={badgeText} />
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          }) : (
            <View style={styles.centerBox}>
              <Info size={48} color="#94A3B8" />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Topics Available</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>There are no clinical topics listed for this subject yet.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitleContainer: { marginLeft: 15 },
  badge: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 4 },
  badgeText: { fontSize: 11, color: '#6366F1', fontWeight: 'bold', letterSpacing: 0.5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  subtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  scrollContent: { padding: 20 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 15, fontWeight: '500' },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  topicSection: { borderRadius: 24, padding: 20, marginBottom: 20, elevation: 3, shadowOpacity: 0.05 },
  topicHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  numberBadge: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  numberText: { fontSize: 14, fontWeight: 'bold', color: '#6366F1' },
  topicTitle: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  typeButton: { flex: 0.48, height: 52, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  typeButtonText: { color: '#FFF', fontSize: 13, fontWeight: 'bold', marginLeft: 8 },
  historySection: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 15,
  },
  historySectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 85,
  },
  historyPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  historyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  }
});

export default TopicScreen;

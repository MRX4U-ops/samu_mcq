import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bookmark, ChevronRight, CircleCheck, CircleX, Info, Timer as TimerIcon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import useAuthStore from '../store/authStore';
import useSubscriptionStore from '../store/subscriptionStore';
import { Alert } from 'react-native';
import { API_URL } from '../config/Constants';
import { MCQ_REPOSITORY } from '../data/mcqRepository';

import { supabase } from '../services/supabaseClient';

const MCQScreen = ({ route, navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuthStore();
  const { topicId, title } = route.params || { topicId: 1, title: 'Medical Case Study' };
  
  const rawType = route.params?.taskType || route.params?.mode || 'test';
  const taskType = (rawType === 'test_question' || rawType === 'test') ? 'test' : 'situational';
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const isMasterTopic = topicId && typeof topicId === 'string' && topicId.startsWith('master-');
  const [timeLeft, setTimeLeft] = useState(isMasterTopic ? 40 * 60 : 30 * 60); 
  const [userAnswers, setUserAnswers] = useState([]); 
  const [quizMode, setQuizMode] = useState('quiz');
  
  const startTime = useRef(Date.now());
  // Prevent double submission (timer + manual submit race condition)
  const quizFinished = useRef(false);

  const userAnswersRef = useRef(userAnswers);
  const currentIndexRef = useRef(currentIndex);
  const timeLeftRef = useRef(timeLeft);

  useEffect(() => {
    userAnswersRef.current = userAnswers;
  }, [userAnswers]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const saveActiveAttempt = useCallback(async (updatedAnswers, updatedIndex, updatedTime) => {
    try {
      if (quizFinished.current) return;
      const attemptKey = `samu_mcq_active_attempt_${topicId}_${taskType}`;
      if (!questions || questions.length === 0) return;
      
      const attemptState = {
        questions,
        userAnswers: updatedAnswers !== undefined ? updatedAnswers : userAnswersRef.current,
        currentIndex: updatedIndex !== undefined ? updatedIndex : currentIndexRef.current,
        timeLeft: updatedTime !== undefined ? updatedTime : timeLeftRef.current,
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem(attemptKey, JSON.stringify(attemptState));
    } catch (err) {
      console.warn('[Attempts Save] Auto-save failed:', err.message);
    }
  }, [questions, topicId, taskType]);

  // Intercept back navigation to prevent accidental discard
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (quizFinished.current) {
        return;
      }

      e.preventDefault();

      Alert.alert(
        "Save & Exit?",
        "Your quiz attempt progress will be saved. You can resume this attempt at any time.",
        [
          { text: "Resume Quiz", style: "cancel", onPress: () => {} },
          { 
            text: "Save & Exit", 
            onPress: async () => {
              quizFinished.current = true;
              try {
                await saveActiveAttempt(userAnswersRef.current, currentIndexRef.current, timeLeftRef.current);
              } catch (err) {
                console.warn('[Attempts Save] Save on exit failed:', err.message);
              }
              navigation.dispatch(e.data.action);
            } 
          }
        ]
      );
    });

    return unsubscribe;
  }, [navigation, topicId, taskType, saveActiveAttempt]);

  useEffect(() => {
    const checkAndFetch = async () => {
      try {
        const attemptKey = `samu_mcq_active_attempt_${topicId}_${taskType}`;
        const savedAttemptStr = await AsyncStorage.getItem(attemptKey);
        
        if (savedAttemptStr) {
          const savedAttempt = JSON.parse(savedAttemptStr);
          
          if (savedAttempt.questions && savedAttempt.questions.length > 0) {
            setQuestions(savedAttempt.questions);
            setUserAnswers(savedAttempt.userAnswers || []);
            setCurrentIndex(savedAttempt.currentIndex || 0);
            setTimeLeft(savedAttempt.timeLeft);
            
            const elapsed = (isMasterTopic ? 40 * 60 : 30 * 60) - savedAttempt.timeLeft;
            startTime.current = Date.now() - (elapsed * 1000);
            
            const savedAns = savedAttempt.userAnswers || [];
            const currentIdx = savedAttempt.currentIndex || 0;
            const ans = savedAns[currentIdx];
            setSelectedOption(ans !== undefined && ans !== null ? ans : null);
            setIsSubmitted(ans !== undefined && ans !== null);
            
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('[Attempts Resume] Check failed:', err.message);
      }
      
      fetchQuestions();
    };

    const fetchQuestions = async () => {
      // 1. CHECK IF MASTER TOPIC
      const isMaster = topicId.startsWith('master-');
      
      if (isMaster) {
        const subjectId = topicId.split('master-')[1];
        let pool = [];
        
        if (MCQ_REPOSITORY[subjectId]) {
          Object.keys(MCQ_REPOSITORY[subjectId]).forEach(tKey => {
            const tData = MCQ_REPOSITORY[subjectId][tKey];
            if (Array.isArray(tData)) {
              // Flat array format: default all to 'test' taskType
              const items = tData.map(q => ({ ...q, taskType: 'test' }));
              pool = [...pool, ...items];
            } else if (tData && typeof tData === 'object') {
              if (Array.isArray(tData.test)) {
                const items = tData.test.map(q => ({ ...q, taskType: 'test' }));
                pool = [...pool, ...items];
              }
              if (Array.isArray(tData.situational)) {
                const items = tData.situational.map(q => ({ ...q, taskType: 'situational' }));
                pool = [...pool, ...items];
              }
            }
          });
        }

        if (pool.length > 0) {
          // Shuffle the master pool to ensure a diverse and randomized set of questions
          const shuffledPool = [...pool];
          for (let i = shuffledPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
          }

          const count = Math.min(shuffledPool.length, 50);
          const selected = shuffledPool.slice(0, count);

          // Map questions: shuffle options, update correctIndex, and set ID/type
          const mapped = selected.map((q, idx) => {
            const options = [...q.options];
            const correctValue = options[q.correctIndex !== undefined ? q.correctIndex : 0];
            
            // Shuffle options
            for (let i = options.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [options[i], options[j]] = [options[j], options[i]];
            }
            
            return {
              _id: `${topicId}-${q.taskType}-${idx}`,
              ...q,
              options,
              correctIndex: options.indexOf(correctValue),
              taskType: q.taskType
            };
          });

          setQuestions(mapped);
          setLoading(false);
          return;
        }
      }

      // 2. CHECK LOCAL REPOSITORY
      let localData = null;
      const isUUID = topicId.includes('-') && topicId.length > 20;

      if (isUUID) {
        const sKey = route.params?.subjectId;
        const topicNum = title?.match(/\d+/);
        if (sKey && MCQ_REPOSITORY[sKey] && topicNum) {
          const tKey = `t-${sKey}-${topicNum[0]}`;
          localData = MCQ_REPOSITORY[sKey][tKey];
        }
      } else {
        for (const sKey in MCQ_REPOSITORY) {
          if (MCQ_REPOSITORY[sKey][topicId]) {
            localData = MCQ_REPOSITORY[sKey][topicId];
            break;
          }
        }
      }

      if (localData) {
        let mcqsToMap = [];
        if (Array.isArray(localData)) {
          mcqsToMap = localData;
        } else {
          mcqsToMap = localData[taskType] || localData.test || [];
        }
        
        let finalPool = mcqsToMap; 
        
        if (finalPool.length > 0) {
          const mapped = finalPool.map((q, idx) => {
            const options = [...q.options];
            const correctValue = options[0];
            
            // Shuffle
            for (let i = options.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [options[i], options[j]] = [options[j], options[i]];
            }
            
            return {
              _id: `${topicId}-${taskType}-${idx}`,
              ...q,
              options,
              correctIndex: options.indexOf(correctValue),
              taskType
            };
          });
          
          setQuestions(mapped);
          setLoading(false);
          return; 
        }
        if (topicId.startsWith('t-s-')) {
          console.error(`Local content missing for topic: ${topicId}`);
          setLoading(false);
          setQuestions([]);
          return;
        }
      }

      // 3. NETWORK FALLBACK
      try {
        const response = await fetch(`${API_URL}/mcqs?topicId=${topicId}&taskType=${taskType}`);
        if (!response.ok) throw new Error('Server error');
        let data = await response.json();
        
        if (data && data.length > 0) {
          if (isMaster) {
            const shuffledPool = [...data];
            for (let i = shuffledPool.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
            }
            const count = Math.min(shuffledPool.length, 50);
            setQuestions(shuffledPool.slice(0, count));
          } else {
            setQuestions(data);
          }
        } else {
          setQuestions([]);
        }
      } catch (e) {
        console.warn("MCQ fetch failed:", e.message);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    checkAndFetch();
  }, [topicId, taskType, isMasterTopic]);

  // useCallback ensures handleFinalSubmit always uses latest state via refs
  const handleFinalSubmit = useCallback((answersOverride) => {
    // Prevent double submission
    if (quizFinished.current) return;
    quizFinished.current = true;

    // Clear stored active attempt state
    const attemptKey = `samu_mcq_active_attempt_${topicId}_${taskType}`;
    AsyncStorage.removeItem(attemptKey).catch(err => {
      console.warn('[Attempts Clear] Submit cleanup failed:', err.message);
    });

    const latestAnswers = answersOverride || userAnswers;

    const finalScore = questions.reduce((acc, q, idx) => {
      return acc + (latestAnswers[idx] === q.correctIndex ? 1 : 0);
    }, 0);
    
    const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
    const totalQ = questions.length;
    
    // Submit to Supabase for Leaderboard & Rewards
    if (user) {
      supabase.rpc('record_quiz_attempt', {
        p_user_id: user.id,
        p_subject_id: route.params?.subjectId || 'general',
        p_topic_id: topicId,
        p_correct_count: finalScore,
        p_total_questions: totalQ
      }).then(({ error }) => {
        if (error) console.warn('[Leaderboard] Submission failed:', error.message);
      });
    }

    const attempted = latestAnswers.filter(a => a !== undefined && a !== null).length;
    const accuracy = totalQ > 0 ? Math.round((finalScore / totalQ) * 100) : 0;

    // Save to AsyncStorage for Attempt History
    const saveAttemptHistory = async () => {
      try {
        const historyKey = 'samu_mcq_attempts_history';
        const existingHistoryStr = await AsyncStorage.getItem(historyKey);
        let history = existingHistoryStr ? JSON.parse(existingHistoryStr) : {};

        const key = `${topicId}_${taskType}`;
        if (!history[key]) {
          history[key] = [];
        }

        const newAttempt = {
          correct: finalScore,
          total: totalQ,
          accuracy,
          timeTaken: `${Math.floor(timeTaken / 60)}:${(timeTaken % 60).toString().padStart(2, '0')}`,
          date: Date.now(),
          questions: questions.map((q, i) => ({
            question: q.question || '',
            options: Array.isArray(q.options) ? q.options : [],
            correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
            explanation: q.explanation || '',
            userIndex: latestAnswers[i] !== undefined ? latestAnswers[i] : null,
          }))
        };

        history[key].unshift(newAttempt);

        if (history[key].length > 3) {
          history[key] = history[key].slice(0, 3);
        }

        await AsyncStorage.setItem(historyKey, JSON.stringify(history));
      } catch (error) {
        console.warn('[Attempts History] Save failed:', error.message);
      }
    };
    saveAttemptHistory();

    navigation.navigate('Result', {
      resultData: {
        totalQuestions: totalQ,
        attempted,
        correct: finalScore,
        wrong: totalQ - finalScore,
        skipped: totalQ - attempted,
        accuracy,
        timeTaken: `${Math.floor(timeTaken / 60)}:${(timeTaken % 60).toString().padStart(2, '0')}`,
        topicName: title || 'Quiz',
        subjectId: route.params?.subjectId || 'general',
        subjectTitle: route.params?.subjectTitle || 'Topics',
        courseTitle: route.params?.courseTitle || 'Course',
        questions: questions.map((q, i) => ({
          question: q.question || '',
          options: Array.isArray(q.options) ? q.options : [],
          correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
          explanation: q.explanation || '',
          userIndex: latestAnswers[i] !== undefined ? latestAnswers[i] : null,
        }))
      }
    });
  }, [questions, userAnswers, user, topicId, title, navigation, taskType]);

  // Timer — only runs when quiz is active
  useEffect(() => {
    if (quizFinished.current) return;
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        const nextTime = timeLeft - 1;
        setTimeLeft(nextTime);
        if (nextTime % 10 === 0) {
          saveActiveAttempt(userAnswersRef.current, currentIndexRef.current, nextTime);
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !quizFinished.current) {
      handleFinalSubmit(userAnswersRef.current);
    }
  }, [timeLeft, handleFinalSubmit, saveActiveAttempt]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (index) => {
    if (isSubmitted && quizMode !== 'review') return;
    if (quizMode === 'review') {
       const newUserAnswers = [...userAnswers];
       newUserAnswers[currentIndex] = index;
       setUserAnswers(newUserAnswers);
       setSelectedOption(index);
       saveActiveAttempt(newUserAnswers, currentIndex, timeLeftRef.current);
       return;
    }
    setSelectedOption(index);
    setIsSubmitted(true);
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentIndex] = index;
    setUserAnswers(newUserAnswers);
    saveActiveAttempt(newUserAnswers, currentIndex, timeLeftRef.current);
  };

  const handleSkip = () => {
    if (isSubmitted || quizMode === 'review') return;
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentIndex] = null;
    setUserAnswers(newUserAnswers);
    saveActiveAttempt(newUserAnswers, currentIndex, timeLeftRef.current);
    handleNext(newUserAnswers);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setSelectedOption(userAnswers[prevIndex] !== undefined && userAnswers[prevIndex] !== null ? userAnswers[prevIndex] : null);
      setIsSubmitted(userAnswers[prevIndex] !== undefined && userAnswers[prevIndex] !== null);
      saveActiveAttempt(userAnswers, prevIndex, timeLeftRef.current);
    }
  };

  const handleNext = (answersOverride) => {
    const latestAnswers = answersOverride || userAnswers;
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedOption(latestAnswers[nextIdx] !== undefined && latestAnswers[nextIdx] !== null ? latestAnswers[nextIdx] : null);
      setIsSubmitted(latestAnswers[nextIdx] !== undefined && latestAnswers[nextIdx] !== null);
      saveActiveAttempt(latestAnswers, nextIdx, timeLeftRef.current);
    } else {
      Alert.alert(
        "Finish Quiz",
        "Are you sure you want to submit your answers and see your results?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Submit", onPress: () => handleFinalSubmit(latestAnswers) }
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!questions.length) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>No questions found for this topic.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#6366F1' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.topicTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
          <Text style={styles.progressText}>Question {currentIndex + 1} of {questions.length}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.finishBtn, { backgroundColor: colors.primary + '15' }]} 
            onPress={() => {
              Alert.alert(
                "Finish Early",
                "Are you sure you want to end the quiz now?",
                [
                  { text: "Continue", style: "cancel" },
                  { text: "Finish", onPress: () => handleFinalSubmit(userAnswers) }
                ]
              );
            }}
          >
            <Text style={[styles.finishBtnText, { color: colors.primary }]}>Finish</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsBookmarked(!isBookmarked)} style={{ marginLeft: 15 }}>
            <Bookmark size={22} color={isBookmarked ? "#6366F1" : colors.textSecondary} fill={isBookmarked ? "#6366F1" : "transparent"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Timer & Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBadge, { backgroundColor: colors.surface }]}>
            <TimerIcon size={16} color="#6366F1" />
            <Text style={[styles.statText, { color: colors.text }]}>{formatTime(timeLeft)}</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: colors.surface }]}>
            <Info size={16} color="#F59E0B" />
            <Text style={[styles.statText, { color: colors.text }]}>{currentQuestion.taskType === 'situational' ? 'Clinical' : 'Test'}</Text>
          </View>
        </View>

        {/* Unified Question & Options Card (matching user screenshot layout) */}
        <View style={[styles.questionCard, { backgroundColor: colors.questionBg, padding: 22, borderRadius: 22 }]}>
          {/* Question Text */}
          <Text style={[styles.questionText, { color: colors.questionText, marginBottom: 18 }]}>
            {currentQuestion.question}
          </Text>

          {/* Prompt 'Select one:' just like in screenshot */}
          <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.questionText + '80', marginBottom: 12 }}>
            Select one:
          </Text>

          {/* Options */}
          <View style={[styles.optionsContainer, { gap: 8 }]}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrect = index === currentQuestion.correctIndex;
              
              let borderColor = colors.questionText + '15';
              let bgColor = 'transparent';
              let textColor = colors.questionText;
              
              if (isSubmitted) {
                if (isCorrect) {
                  borderColor = '#10B981';
                  bgColor = '#ECFDF5';
                  textColor = '#166534';
                } else if (isSelected) {
                  borderColor = '#EF4444';
                  bgColor = '#FEF2F2';
                  textColor = '#991B1B';
                }
              } else if (isSelected) {
                borderColor = colors.primary;
                bgColor = colors.primary + '15';
                textColor = colors.primary;
              }

              const letter = String.fromCharCode(97 + index);

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionBtn, 
                    { 
                      borderColor, 
                      backgroundColor: bgColor,
                      borderWidth: 1.5,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 14
                    }
                  ]}
                  onPress={() => handleOptionSelect(index)}
                >
                  <View style={styles.optionContent}>
                    {/* Radio button circle style like the screenshot */}
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: isSelected ? colors.primary : colors.questionText + '60',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12
                    }}>
                      {isSelected && (
                        <View style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: colors.primary
                        }} />
                      )}
                    </View>
                    <Text style={[styles.optionText, { color: textColor, fontWeight: '600' }]}>
                      {letter}. {option}
                    </Text>
                  </View>
                  {isSubmitted && isCorrect && <CircleCheck size={18} color="#10B981" />}
                  {isSubmitted && isSelected && !isCorrect && <CircleX size={18} color="#EF4444" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Explanation */}
        {isSubmitted && (
          <View style={[styles.explanationCard, { backgroundColor: '#F8FAFC' }]}>
            <View style={styles.explHeader}>
              <Info size={16} color="#6366F1" />
              <Text style={styles.explTitle}>EXPLANATION</Text>
            </View>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.navBtn, currentIndex === 0 && { opacity: 0.5 }]} 
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <Text style={[styles.navBtnText, { color: colors.textSecondary }]}>Previous</Text>
        </TouchableOpacity>

        {isSubmitted || currentIndex === questions.length - 1 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={() => handleNext(userAnswers)}>
            <Text style={styles.nextBtnText}>
              {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </Text>
            <ChevronRight size={20} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipBtnText}>Skip Question</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  headerInfo: { flex: 1, marginLeft: 15 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  finishBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  finishBtnText: { fontSize: 13, fontWeight: 'bold' },
  topicTitle: { fontSize: 16, fontWeight: 'bold' },
  progressText: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  scrollContent: { padding: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, gap: 6 },
  statText: { fontSize: 13, fontWeight: '600' },
  questionCard: { padding: 20, borderRadius: 20, marginBottom: 25 },
  questionText: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
  optionsContainer: { gap: 12 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, justifyContent: 'space-between' },
  optionContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  optionIndex: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  optionText: { fontSize: 15, fontWeight: '500', flex: 1 },
  explanationCard: { padding: 20, borderRadius: 20, marginTop: 25 },
  explHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  explTitle: { fontSize: 12, fontWeight: '900', color: '#6366F1', letterSpacing: 1 },
  explanationText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  footer: { flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1 },
  navBtn: { padding: 10 },
  navBtnText: { fontWeight: 'bold' },
  skipBtn: { paddingHorizontal: 20, paddingVertical: 12 },
  skipBtnText: { color: '#94A3B8', fontWeight: 'bold' },
  nextBtn: { backgroundColor: '#6366F1', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, gap: 5 },
  nextBtnText: { color: '#FFF', fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default MCQScreen;

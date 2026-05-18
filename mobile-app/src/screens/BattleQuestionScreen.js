import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Clock, CheckCircle, Info, Users, Check, X } from 'lucide-react-native';
import { useBattleStore } from '../store/battleStore';

const BattleQuestionScreen = ({ navigation }) => {
  const {
    status,
    currentIndex,
    activeQuestion,
    selectedOptionIndex,
    isAnswerLocked,
    timeLeft,
    revealedResult,
    playerAnswersCount,
    participants
  } = useBattleStore();

  useEffect(() => {
    if (status === 'ended') {
      navigation.replace('Leaderboard');
    }
  }, [status]);

  if (!activeQuestion) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Initializing Battle Board...</Text>
      </SafeAreaView>
    );
  }

  const handleOptionSelect = (index) => {
    if (isAnswerLocked) return;
    const { submitAnswer } = useBattleStore.getState();
    submitAnswer(index);
  };

  const isTimeCritical = timeLeft <= 5;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar: Progress and Countdown */}
      <View style={styles.topBar}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>QUESTION</Text>
          <Text style={styles.progressNumber}>
            {currentIndex + 1} <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>/ {activeQuestion.totalQuestions}</Text>
          </Text>
        </View>

        {/* Circular Countdown Timer */}
        <View style={[
          styles.timerCircle, 
          isTimeCritical && { borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }
        ]}>
          <Clock size={20} color={isTimeCritical ? '#EF4444' : '#10B981'} />
          <Text style={[styles.timerText, isTimeCritical && { color: '#EF4444' }]}>
            {timeLeft}s
          </Text>
        </View>
      </View>

      {/* Realtime Players Answered Status Bar */}
      <View style={styles.answeredBar}>
        <View style={styles.avatarsRow}>
          {participants.map((player) => {
            const hasAnswered = player.answersCount > currentIndex;
            return (
              <View 
                key={player.userId} 
                style={[
                  styles.playerDot, 
                  hasAnswered && { backgroundColor: '#10B981', borderColor: '#34D399' }
                ]}
              >
                <Text style={styles.dotLetter}>{player.name.charAt(0).toUpperCase()}</Text>
                {hasAnswered && (
                  <View style={styles.checkBadge}>
                    <Check size={8} color="#FFF" strokeWidth={4} />
                  </View>
                )}
              </View>
            );
          })}
        </View>
        <Text style={styles.answeredText}>
          {playerAnswersCount} of {participants.length} locked in
        </Text>
      </View>

      {/* Sheet Content: Question & Options */}
      <ScrollView 
        style={styles.sheet}
        contentContainerStyle={styles.sheetContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionBox}>
          <Text style={styles.questionText}>
            {activeQuestion.question}
          </Text>
        </View>

        <View style={styles.optionsList}>
          {activeQuestion.options.map((opt, i) => {
            const isSelected = i === selectedOptionIndex;
            const isRevealed = revealedResult !== null;
            const isCorrectAnswer = isRevealed && i === revealedResult.correctIndex;
            
            let btnStyle = styles.optionBtn;
            let textStyle = styles.optionTxt;
            let iconToShow = null;

            if (isRevealed) {
              if (isCorrectAnswer) {
                btnStyle = [styles.optionBtn, styles.correctBtn];
                textStyle = [styles.optionTxt, styles.correctTxt];
                iconToShow = <CheckCircle size={20} color="#10B981" />;
              } else if (isSelected) {
                btnStyle = [styles.optionBtn, styles.wrongBtn];
                textStyle = [styles.optionTxt, styles.wrongTxt];
                iconToShow = <X size={20} color="#EF4444" />;
              } else {
                btnStyle = [styles.optionBtn, styles.disabledBtn];
                textStyle = [styles.optionTxt, styles.disabledTxt];
              }
            } else if (isSelected) {
              btnStyle = [styles.optionBtn, styles.selectedBtn];
              textStyle = [styles.optionTxt, styles.selectedTxt];
            }

            return (
              <TouchableOpacity
                key={i}
                style={btnStyle}
                onPress={() => handleOptionSelect(i)}
                disabled={isAnswerLocked || isRevealed}
                activeOpacity={0.7}
              >
                <Text style={textStyle}>{opt}</Text>
                {iconToShow}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explain Card during Reveal Phase */}
        {revealedResult && (
          <View style={styles.explainCard}>
            <View style={styles.explainHeader}>
              <Info size={16} color="#4F46E5" style={{ marginRight: 6 }} />
              <Text style={styles.explainTitle}>EXPLANATION</Text>
            </View>
            <Text style={styles.explainText}>
              {revealedResult.explanation || "No explanation provided for this question."}
            </Text>
          </View>
        )}

        {/* Waiting prompt when locked but server countdown is still active */}
        {isAnswerLocked && !revealedResult && (
          <View style={styles.waitingCard}>
            <ActivityIndicator size="small" color="#6366F1" style={{ marginRight: 10 }} />
            <Text style={styles.waitingText}>Locked in! Waiting for others...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1B4B' },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#C7D2FE', fontSize: 14, fontWeight: '600', marginTop: 16 },
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingVertical: 20 
  },
  progressContainer: { flexDirection: 'column' },
  progressLabel: { fontSize: 10, fontWeight: '900', color: '#A5B4FC', letterSpacing: 1.5 },
  progressNumber: { fontSize: 26, fontWeight: 'bold', color: '#FFF', marginTop: 2 },
  timerCircle: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
    borderWidth: 2, 
    borderColor: '#10B981', 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20 
  },
  timerText: { color: '#10B981', fontSize: 16, fontWeight: 'bold', marginLeft: 6 },
  answeredBar: { 
    paddingHorizontal: 24, 
    paddingBottom: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  avatarsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  playerDot: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 6,
    position: 'relative'
  },
  dotLetter: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  checkBadge: { 
    position: 'absolute', 
    bottom: -2, 
    right: -2, 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    backgroundColor: '#10B981', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  answeredText: { fontSize: 12, color: '#A5B4FC', fontWeight: '600' },
  sheet: { flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 36, borderTopRightRadius: 36 },
  sheetContent: { padding: 30, paddingBottom: 60 },
  questionBox: { marginBottom: 24 },
  questionText: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', lineHeight: 28 },
  optionsList: { gap: 12, marginBottom: 24 },
  optionBtn: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6', 
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 18, 
    borderRadius: 20 
  },
  optionTxt: { fontSize: 16, fontWeight: '600', color: '#374151', flexShrink: 1, marginRight: 10 },
  selectedBtn: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
  selectedTxt: { color: '#4F46E5' },
  correctBtn: { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
  correctTxt: { color: '#065F46' },
  wrongBtn: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  wrongTxt: { color: '#991B1B' },
  disabledBtn: { opacity: 0.6 },
  disabledTxt: { color: '#9CA3AF' },
  explainCard: { 
    backgroundColor: 'rgba(99, 102, 241, 0.05)', 
    borderWidth: 1, 
    borderColor: 'rgba(99, 102, 241, 0.1)', 
    padding: 20, 
    borderRadius: 20, 
    marginTop: 10 
  },
  explainHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  explainTitle: { fontSize: 11, fontWeight: '900', color: '#4F46E5', letterSpacing: 1.5 },
  explainText: { fontSize: 14, color: '#4B5563', lineHeight: 22, fontWeight: '500' },
  waitingCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#EEF2FF', 
    padding: 16, 
    borderRadius: 16,
    marginTop: 10
  },
  waitingText: { fontSize: 14, color: '#4F46E5', fontWeight: '600' }
});

export default BattleQuestionScreen;

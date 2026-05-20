import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, ArrowRight, CircleCheck, Clock } from 'lucide-react-native';
import { useBattleStore } from '../store/battleStore';
import { useTheme } from '../context/ThemeContext';

const LiveBattleScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { 
    questions,
    currentIndex,
    answers,
    hasFinished,
    participants,
    setAnswer,
    nextQuestion,
    prevQuestion,
    submitQuiz,
    status
  } = useBattleStore();

  // My current score (find myself in participants, hardcoded name 'Player' for now or by ID)
  // We'll just assume my score is tracked locally or via participants array
  const myParticipant = participants[0] || { score: 0 }; 

  useEffect(() => {
    if (status === 'ended') {
      navigation.navigate('Leaderboard'); // or BattleResultScreen
    }
  }, [status, navigation]);

  const currentQuestion = questions[currentIndex];
  const selectedOptionIndex = currentQuestion ? answers[currentQuestion.mcqId] : null;

  const handleAnswer = (index) => {
    if (hasFinished || !currentQuestion) return;
    if (selectedOptionIndex !== null) return; // LOCK: Cannot change answer
    
    setAnswer(currentQuestion.mcqId, index);
  };

  const handleSubmit = async () => {
    await submitQuiz();
  };

  if (hasFinished) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Clock size={48} color="#FFFFFF" style={{ marginBottom: 20 }} />
        <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Quiz Submitted!</Text>
        <Text style={{ color: '#E0E7FF', fontSize: 16 }}>Waiting for other players to finish...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>Quiz Progress</Text>
        <View style={styles.scoreBox}>
          <CircleCheck size={16} color="#10B981" />
          <Text style={styles.scoreText}>{Object.keys(answers).length} / {questions.length} Answered</Text>
        </View>
      </View>

      <View style={styles.battleInfo}>
        <View style={styles.playerProgress}>
           {participants.map((p, i) => (
             <View key={i} style={[styles.playerDot, p.finished ? styles.playerDotActive : {}]} />
           ))}
        </View>
        <Text style={styles.opponentStatus}>Waiting for {participants.length - participants.filter(p=>p.finished).length} players to finish...</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {currentQuestion ? (
          <>
            <View style={[styles.questionContainer, { backgroundColor: colors.questionBg, padding: 22, borderRadius: 24, marginBottom: 20 }]}>
              <Text style={styles.questionNum}>Question {currentQuestion.questionIndex + 1} / {currentQuestion.totalQuestions}</Text>
              <Text style={[styles.questionText, { color: colors.questionText, marginBottom: 16 }]}>{currentQuestion.question}</Text>
              
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.questionText + '80', marginBottom: 12 }}>
                Select one:
              </Text>

              <View style={[styles.optionsGrid, { marginTop: 0, marginBottom: 0 }]}>
                {currentQuestion.options.map((opt, i) => {
                  const isSelected = i === selectedOptionIndex;
                  const isCorrect = i === currentQuestion.correctIndex;
                  const isSubmitted = selectedOptionIndex !== null;

                  let borderCol = colors.questionText + '15';
                  let bgCol = 'transparent';
                  let txtCol = colors.questionText;

                  if (isSubmitted) {
                    if (isCorrect) {
                      borderCol = '#10B981';
                      bgCol = '#ECFDF5';
                      txtCol = '#166534';
                    } else if (isSelected) {
                      borderCol = '#EF4444';
                      bgCol = '#FEF2F2';
                      txtCol = '#991B1B';
                    }
                  } else if (isSelected) {
                    borderCol = colors.primary;
                    bgCol = colors.primary + '15';
                    txtCol = colors.primary;
                  }

                  const letter = String.fromCharCode(97 + i);

                  return (
                    <TouchableOpacity 
                      key={i} 
                      style={[
                        styles.optionButton, 
                        { 
                          backgroundColor: bgCol, 
                          borderColor: borderCol,
                          borderWidth: 1.5,
                          borderRadius: 14,
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          marginBottom: 8,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }
                      ]} 
                      onPress={() => handleAnswer(i)}
                      activeOpacity={isSubmitted ? 1 : 0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
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
                        <Text style={[styles.optionText, { color: txtCol, fontWeight: '600', flex: 1, marginHorizontal: 0, paddingLeft: 0 }]}>
                          {letter}. {opt}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.navContainer}>
              <TouchableOpacity 
                style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]} 
                onPress={prevQuestion}
                disabled={currentIndex === 0}
              >
                <ArrowLeft size={20} color={currentIndex === 0 ? "#9CA3AF" : "#4B5563"} />
                <Text style={[styles.navButtonText, currentIndex === 0 && { color: '#9CA3AF' }]}>Back</Text>
              </TouchableOpacity>

              {currentIndex < questions.length - 1 ? (
                <TouchableOpacity 
                  style={[styles.navButton, styles.navButtonPrimary]} 
                  onPress={nextQuestion}
                >
                  <Text style={styles.navButtonTextLight}>{selectedOptionIndex !== null ? 'Next' : 'Skip'}</Text>
                  <ArrowRight size={20} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.navButton, styles.submitButton]} 
                  onPress={handleSubmit}
                >
                  <CircleCheck size={20} color="#FFFFFF" />
                  <Text style={styles.navButtonTextLight}>Submit Quiz</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>Loading question...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4338CA' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  timerBox: { backgroundColor: '#FFFFFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  timerText: { marginLeft: 8, fontWeight: 'bold', color: '#EF4444', fontSize: 16 },
  scoreBox: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  scoreText: { marginLeft: 8, fontWeight: 'bold', color: '#FFFFFF', fontSize: 16 },
  battleInfo: { paddingHorizontal: 20, marginBottom: 20 },
  playerProgress: { flexDirection: 'row', marginBottom: 10, flexWrap: 'wrap' },
  playerDotActive: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#10B981', marginRight: 8, marginBottom: 8 },
  playerDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.3)', marginRight: 8, marginBottom: 8 },
  opponentStatus: { color: '#E0E7FF', fontSize: 12, fontWeight: '500' },
  content: { backgroundColor: '#FFFFFF', flex: 1, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 30, minHeight: '80%' },
  questionContainer: { marginBottom: 30 },
  questionNum: { color: '#6366F1', fontWeight: 'bold', fontSize: 14, marginBottom: 10 },
  questionText: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', lineHeight: 28 },
  optionsGrid: { gap: 12, marginBottom: 30 },
  optionButton: { padding: 20, borderRadius: 16, borderWidth: 2 },
  optionText: { fontSize: 16, fontWeight: '600' },
  navContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  navButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: '#F3F4F6' },
  navButtonDisabled: { opacity: 0.5 },
  navButtonPrimary: { backgroundColor: '#6366F1' },
  submitButton: { backgroundColor: '#10B981' },
  navButtonText: { fontSize: 16, fontWeight: 'bold', color: '#4B5563', marginLeft: 8 },
  navButtonTextLight: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginRight: 8, marginLeft: 8 }
});

export default LiveBattleScreen;

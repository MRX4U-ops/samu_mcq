import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { ArrowLeft, CircleCheck, CircleX, Info, ChevronRight, Filter } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const ReviewScreen = ({ route, navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const { questions } = route.params || { questions: [] };
  const [showOnlyWrong, setShowOnlyWrong] = useState(false);

  const filteredQuestions = showOnlyWrong
    ? questions.filter(item => item.userIndex !== item.correctIndex)
    : questions;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Review Answers</Text>
        <TouchableOpacity 
          onPress={() => setShowOnlyWrong(prev => !prev)}
          style={[styles.filterButton, showOnlyWrong && { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 6 }]}
        >
          <Filter size={22} color={showOnlyWrong ? '#EF4444' : colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredQuestions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={[styles.emptyText, { color: colors.text }]}>No Incorrect Answers!</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              You got 100% correct in this session. There are no mistakes to review!
            </Text>
          </View>
        ) : (
          filteredQuestions.map((item, index) => {
            const originalIndex = questions.indexOf(item);
            const isCorrect = item.userIndex === item.correctIndex;
            const isSkipped = item.userIndex === null;
          
            return (
              <View key={index} style={[styles.qCard, { backgroundColor: colors.surface }]}>
                <View style={styles.qHeader}>
                  <View style={[styles.qIndex, { backgroundColor: colors.accent + '20' }]}>
                     <Text style={[styles.qIndexText, { color: colors.accent }]}>{originalIndex + 1}</Text>
                  </View>
                <View style={styles.statusBadge}>
                   {isCorrect ? (
                     <View style={styles.badgeRow}><CircleCheck size={16} color="#10B981" /><Text style={styles.correctText}>Correct</Text></View>
                   ) : isSkipped ? (
                     <View style={styles.badgeRow}><Info size={16} color="#94A3B8" /><Text style={styles.skippedText}>Skipped</Text></View>
                   ) : (
                     <View style={styles.badgeRow}><CircleX size={16} color="#EF4444" /><Text style={styles.wrongText}>Incorrect</Text></View>
                   )}
                </View>
              </View>

              <View style={[{ backgroundColor: colors.questionBg, padding: 20, borderRadius: 20, marginBottom: 20 }]}>
                <Text style={[styles.questionText, { color: colors.questionText, marginBottom: 16 }]}>{item.question}</Text>
                
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.questionText + '80', marginBottom: 12 }}>
                  Select one:
                </Text>

                <View style={[styles.optionsReview, { marginTop: 0 }]}>
                  {item.options.map((opt, optIdx) => {
                    const isCorrectOpt = optIdx === item.correctIndex;
                    const isUserSelected = optIdx === item.userIndex;
                    
                    let borderCol = colors.questionText + '15';
                    let bgCol = 'transparent';
                    let txtCol = colors.questionText;
                    
                    if (isCorrectOpt) { borderCol = '#10B981'; bgCol = '#ECFDF5'; txtCol = '#166534'; }
                    else if (isUserSelected && !isCorrectOpt) { borderCol = '#EF4444'; bgCol = '#FEF2F2'; txtCol = '#991B1B'; }

                    const letter = String.fromCharCode(97 + optIdx);

                    return (
                      <View key={optIdx} style={[styles.optItem, { borderColor: borderCol, backgroundColor: bgCol, borderWidth: 1.5, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }]}>
                         <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                           <View style={{
                             width: 18,
                             height: 18,
                             borderRadius: 9,
                             borderWidth: 2,
                             borderColor: isUserSelected ? (isCorrectOpt ? '#10B981' : '#EF4444') : colors.questionText + '60',
                             justifyContent: 'center',
                             alignItems: 'center',
                             marginRight: 10
                           }}>
                             {isUserSelected && (
                               <View style={{
                                 width: 8,
                                 height: 8,
                                 borderRadius: 4,
                                 backgroundColor: isCorrectOpt ? '#10B981' : '#EF4444'
                               }} />
                             )}
                           </View>
                           <Text style={[styles.optText, { color: txtCol, fontWeight: '600', flex: 1 }]}>{letter}. {opt}</Text>
                         </View>
                         {isCorrectOpt && <CircleCheck size={16} color="#10B981" />}
                         {isUserSelected && !isCorrectOpt && <CircleX size={16} color="#EF4444" />}
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={[styles.explanation, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
                 <Text style={[styles.explainTitle, { color: colors.accent }]}>Clinical Rationale:</Text>
                 <Text style={[styles.explainText, { color: colors.textSecondary }]}>{item.explanation}</Text>
              </View>
            </View>
          );
        }))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, height: 80, elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  qCard: { padding: 20, borderRadius: 24, marginBottom: 20, elevation: 1 },
  qHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  qIndex: { width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  qIndexText: { fontSize: 14, fontWeight: 'bold' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  correctText: { color: '#10B981', fontSize: 12, fontWeight: 'bold' },
  wrongText: { color: '#EF4444', fontSize: 12, fontWeight: 'bold' },
  skippedText: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold' },
  questionText: { fontSize: 16, fontWeight: '600', lineHeight: 24, marginBottom: 20 },
  optionsReview: { gap: 10, marginBottom: 15 },
  optItem: { padding: 15, borderRadius: 12, borderOuterWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1 },
  optText: { fontSize: 14, flex: 1, marginRight: 10 },
  explanation: { padding: 15, borderRadius: 16 },
  explainTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  explainText: { fontSize: 13, lineHeight: 20 },
  filterButton: { padding: 6, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 60 },
  emptyIcon: { fontSize: 60, marginBottom: 20 },
  emptyText: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 }
});

export default ReviewScreen;

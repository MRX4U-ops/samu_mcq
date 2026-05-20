import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { ChevronLeft, BookOpen, Trash2, CircleCheck, CircleX } from 'lucide-react-native';

import { MCQ_REPOSITORY } from '../data/mcqRepository';
import useAuthStore from '../store/authStore';
import { API_URL } from '../config/Constants';

import { useTheme } from '../context/ThemeContext';

const SavedQuestionsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [expanded, setExpanded] = useState({});
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) fetchSavedQuestions();
    else setLoading(false);
  }, [user]);

  const fetchSavedQuestions = async () => {
    try {
      const response = await fetch(`${API_URL}/users/bookmarks`, {
        headers: { 'user-id': user.id }
      });
      const bookmarkedItems = await response.json();
      const bookmarkIds = bookmarkedItems.map(b => b.question_id);

      // Search in local repository — bookmark IDs are "t-s-2-2-3-0" (topicKey-questionIndex)
      let found = [];
      Object.keys(MCQ_REPOSITORY).forEach(sKey => {
        Object.keys(MCQ_REPOSITORY[sKey]).forEach(tKey => {
          const tData = MCQ_REPOSITORY[sKey][tKey];
          if (Array.isArray(tData)) {
            tData.forEach((q, idx) => {
              const qId = `${tKey}-${idx}`;
              if (bookmarkIds.includes(qId)) {
                found.push({ ...q, bookmarkId: qId, topicKey: tKey, subjectKey: sKey });
              }
            });
          }
        });
      });

      setSavedQuestions(found);
    } catch (error) {
      console.log('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (bookmarkId) => {
    setSavedQuestions(prev => prev.filter(q => q.bookmarkId !== bookmarkId));
    try {
      await fetch(`${API_URL}/users/bookmarks/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'user-id': user.id },
        body: JSON.stringify({ questionId: bookmarkId })
      });
    } catch (e) {
      console.log('Remove bookmark failed:', e.message);
    }
  };

  const getSubjectName = (sKey) => {
    const map = {
      's-1-10': 'Medical Biology Mod.2',
      's-1-11': 'Medical Chemistry Mod.1',
      's-2-0': 'Biochemistry Mod.1',
      's-2-1': 'Biochemistry Mod.2',
      's-2-2': 'Clinical Anatomy',
    };
    return map[sKey] || sKey;
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderItem = ({ item, index }) => {
    const isOpen = expanded[item.bookmarkId];
    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => toggleExpand(item.bookmarkId)} activeOpacity={0.8}>
          <View style={styles.cardHeader}>
            <View style={styles.subjectBadge}>
              <BookOpen size={12} color="#6366F1" />
              <Text style={styles.subjectText}>{getSubjectName(item.subjectKey)}</Text>
            </View>
            <TouchableOpacity onPress={() => removeBookmark(item.bookmarkId)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
          <Text style={styles.questionNum}>Q{index + 1}</Text>
          <View style={[{ backgroundColor: colors.questionBg, padding: 18, borderRadius: 18, marginVertical: 8 }]}>
            <Text style={[styles.questionText, { color: colors.questionText, marginBottom: isOpen ? 16 : 0 }]}>
              {item.question}
            </Text>

            {isOpen && (
              <>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.questionText + '80', marginBottom: 10, marginTop: 10 }}>
                  Select one:
                </Text>
                <View style={[styles.expanded, { marginTop: 0, borderTopWidth: 0, paddingHorizontal: 0, paddingTop: 0 }]}>
                  {item.options.map((opt, i) => {
                    const isCorrect = i === item.correctIndex;
                    const letter = String.fromCharCode(97 + i);
                    return (
                      <View 
                        key={i} 
                        style={[
                          styles.option, 
                          isCorrect && { backgroundColor: '#ECFDF5', borderColor: '#10B981', borderWidth: 1.5 },
                          !isCorrect && { borderColor: colors.questionText + '15', borderWidth: 1.5 },
                          {
                            borderRadius: 12,
                            padding: 10,
                            marginBottom: 6,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }
                        ]}
                      >
                        <View style={{
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          borderWidth: 2,
                          borderColor: isCorrect ? '#10B981' : colors.questionText + '60',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 8
                        }}>
                          {isCorrect && (
                            <View style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#10B981'
                            }} />
                          )}
                        </View>
                        <Text style={[styles.optionText, { color: isCorrect ? '#166534' : colors.questionText, fontWeight: '600', flex: 1, marginRight: 0 }]}>
                          {letter}. {opt}
                        </Text>
                      </View>
                    );
                  })}
                  {item.explanation ? (
                    <View style={[styles.explanationBox, { marginTop: 12, borderTopWidth: 1, borderTopColor: colors.questionText + '15', paddingTop: 12 }]}>
                      <Text style={[styles.explanationLabel, { color: colors.questionText }]}>EXPLANATION</Text>
                      <Text style={[styles.explanationText, { color: colors.questionText + 'BF' }]}>{item.explanation}</Text>
                    </View>
                  ) : null}
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => toggleExpand(item.bookmarkId)} style={styles.toggleBtn}>
          <Text style={styles.toggleText}>{isOpen ? 'Hide Answer ▲' : 'Show Answer ▼'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookmarked Questions</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : savedQuestions.length === 0 ? (
        <View style={styles.center}>
          <BookOpen size={64} color="#E5E7EB" />
          <Text style={styles.emptyText}>No bookmarked questions yet.</Text>
          <Text style={styles.emptySubText}>Tap the bookmark icon during a quiz to save questions here.</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.browseBtnText}>Browse Courses</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedQuestions}
          renderItem={renderItem}
          keyExtractor={item => item.bookmarkId}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  list: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', borderRadius: 20, marginBottom: 14, padding: 16, elevation: 3, shadowColor: '#6366F1', shadowOpacity: 0.06, shadowRadius: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  subjectBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 5 },
  subjectText: { fontSize: 11, fontWeight: '700', color: '#6366F1' },
  questionNum: { fontSize: 11, fontWeight: '900', color: '#94A3B8', marginBottom: 4 },
  questionText: { fontSize: 15, fontWeight: '600', color: '#1E293B', lineHeight: 22 },
  expanded: { marginTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 14, gap: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC', padding: 10, borderRadius: 10 },
  optionCorrect: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#10B981' },
  optionText: { fontSize: 14, color: '#64748B', flex: 1 },
  optionTextCorrect: { color: '#065F46', fontWeight: '700' },
  explanationBox: { backgroundColor: '#FFF7ED', padding: 12, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#F59E0B', marginTop: 8 },
  explanationLabel: { fontSize: 10, fontWeight: '900', color: '#92400E', marginBottom: 4, letterSpacing: 1 },
  explanationText: { fontSize: 13, color: '#78350F', lineHeight: 20 },
  toggleBtn: { marginTop: 12, alignItems: 'center' },
  toggleText: { fontSize: 12, color: '#6366F1', fontWeight: '700' },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 20 },
  emptySubText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  browseBtn: { backgroundColor: '#6366F1', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 14, marginTop: 24 },
  browseBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});

export default SavedQuestionsScreen;

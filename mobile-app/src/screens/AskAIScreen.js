import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Share, KeyboardAvoidingView, Platform, Clipboard } from 'react-native';
import { ArrowLeft, Send, Copy, Share2, Sparkles, RefreshCcw, ChevronDown } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config/Constants';
import useAuthStore from '../store/authStore';

const QUICK_TOPICS = [
  'What is myocardial infarction?',
  'Explain diabetic ketoacidosis',
  'What are signs of meningitis?',
  'Describe the coagulation cascade',
  'What is the blood-brain barrier?',
];

const AskAIScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuthStore();

  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);

  const languages = ['English', 'Hinglish', 'Malayalam'];

  const handleAsk = async (q) => {
    const finalQ = (q || question).trim();
    if (!finalQ) return;
    if (!question && q) setQuestion(q);

    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      console.log('[AI] Asking backend AI helper...');
      const response = await fetch(`${API_URL}/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: finalQ,
          language: language
        })
      });

      if (!response.ok) {
        throw new Error('Server responded with an error: ' + response.status);
      }

      const data = await response.json();
      if (data && data.answer) {
        setAnswer(data.answer);
      } else {
        throw new Error('Invalid response from AI server');
      }
    } catch (err) {
      console.log('[AI] Ask failed:', err.message);
      setError('AI assistant is currently busy. Please try again in a few moments.');
    } finally {
      setLoading(false);
    }
  };

  const onShare = async () => {
    try {
      await Share.share({ message: `Medical Query: ${question}\n\nAnswer: ${answer}\n\nShared via SAMU MCQs AI` });
    } catch (e) { }
  };

  const onCopy = () => {
    Clipboard.setString(answer);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Sparkles size={20} color="#6366F1" />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Medical AI Assistant</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Quick Topics */}
          <View style={styles.quickSection}>
            <Text style={[styles.quickLabel, { color: colors.textSecondary }]}>QUICK TOPICS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickScroll}>
              {QUICK_TOPICS.map((t, i) => (
                <TouchableOpacity key={i} style={styles.quickChip} onPress={() => handleAsk(t)}>
                  <Text style={styles.quickChipText} numberOfLines={1}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Input Card */}
          <View style={[styles.inputCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.label, { color: colors.text }]}>Your Medical Question</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="e.g. What are the symptoms of Hyperthyroidism?"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              value={question}
              onChangeText={setQuestion}
            />

            <Text style={[styles.label, { color: colors.text, marginTop: 18 }]}>Response Language</Text>
            <View style={styles.langRow}>
              {languages.map((l) => (
                <TouchableOpacity
                  key={l}
                  onPress={() => setLanguage(l)}
                  style={[styles.langBtn, { backgroundColor: language === l ? '#6366F1' : colors.background, borderColor: language === l ? '#6366F1' : colors.border }]}
                >
                  <Text style={[styles.langText, { color: language === l ? '#FFF' : colors.textSecondary }]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.askBtn, { backgroundColor: loading || !question.trim() ? '#94A3B8' : '#6366F1' }]}
              onPress={() => handleAsk()}
              disabled={loading || !question.trim()}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : (
                <>
                  <Send size={18} color="#FFF" />
                  <Text style={styles.askBtnText}>Ask AI Now</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={[styles.loaderText, { color: colors.textSecondary }]}>Consulting Medical AI...</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {answer && (
            <View style={[styles.answerCard, { backgroundColor: colors.surface }]}>
              <View style={styles.answerHeader}>
                <View style={styles.aiBadge}>
                  <Sparkles size={14} color="#FFF" />
                  <Text style={styles.aiBadgeText}>AI MEDICAL INSIGHT</Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity onPress={onCopy} style={styles.actionBtn}>
                    <Copy size={18} color="#6366F1" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onShare} style={styles.actionBtn}>
                    <Share2 size={18} color="#6366F1" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[styles.questionLabel, { color: colors.textSecondary }]}>Q: {question}</Text>
              <Text style={[styles.answerText, { color: colors.text }]}>{answer}</Text>
              <Text style={styles.disclaimer}>* For educational use only. Always consult a qualified physician for clinical decisions.</Text>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, borderBottomWidth: 1 },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  quickSection: { marginBottom: 18 },
  quickLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 10 },
  quickScroll: { gap: 10, paddingRight: 16 },
  quickChip: { backgroundColor: '#EEF2FF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, maxWidth: 200 },
  quickChipText: { color: '#6366F1', fontSize: 12, fontWeight: '700' },
  inputCard: { padding: 20, borderRadius: 24, elevation: 3, marginBottom: 20, shadowColor: '#6366F1', shadowOpacity: 0.08, shadowRadius: 10 },
  label: { fontSize: 13, fontWeight: '800', marginBottom: 10, letterSpacing: 0.3 },
  input: { borderWidth: 1, borderRadius: 16, padding: 15, fontSize: 15, minHeight: 100, textAlignVertical: 'top' },
  langRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  langBtn: { flex: 1, height: 42, borderRadius: 12, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  langText: { fontSize: 13, fontWeight: '800' },
  askBtn: { height: 56, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  askBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  loaderBox: { alignItems: 'center', marginVertical: 30, gap: 12 },
  loaderText: { fontWeight: '600', fontSize: 15 },
  errorBox: { padding: 20, backgroundColor: '#FEF2F2', borderRadius: 16, marginBottom: 20 },
  errorText: { color: '#DC2626', textAlign: 'center', fontWeight: '600', lineHeight: 22 },
  answerCard: { padding: 20, borderRadius: 24, elevation: 4, shadowColor: '#6366F1', shadowOpacity: 0.1, shadowRadius: 12 },
  answerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  aiBadge: { backgroundColor: '#6366F1', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, gap: 6 },
  aiBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  actionRow: { flexDirection: 'row', gap: 15 },
  actionBtn: { padding: 6, backgroundColor: '#EEF2FF', borderRadius: 10 },
  questionLabel: { fontSize: 13, fontStyle: 'italic', marginBottom: 12, lineHeight: 20 },
  answerText: { fontSize: 16, lineHeight: 28, fontWeight: '500' },
  disclaimer: { fontSize: 11, color: '#94A3B8', marginTop: 16, fontStyle: 'italic', lineHeight: 16 },
});

export default AskAIScreen;

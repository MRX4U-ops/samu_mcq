import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { ArrowLeft, Bookmark, Sparkles, AlertTriangle, ChevronDown } from 'lucide-react-native';
import useDiagnosticsStore from '../store/diagnosticsStore';
import { API_URL } from '../config/Constants';

const DiagnosticDetailScreen = ({ route, navigation }) => {
  const { test } = route.params;
  const { isBookmarked, toggleBookmark } = useDiagnosticsStore();
  const bookmarked = isBookmarked(test.id);

  // AI Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiError, setAiError] = useState(null);
  
  const handleAskAI = async () => {
    setLoading(true);
    setAiError(null);
    try {
      const question = `Explain this clinical test/condition simply for an MBBS student: ${test.name}. Summarize what it is, when it's high/low, and basic treatment.`;
      const response = await fetch(`${API_URL}/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, language })
      });
      const data = await response.json();
      if (data && data.answer) {
        setAiResponse(data.answer);
      } else {
        throw new Error('Invalid response');
      }
    } catch (err) {
      setAiError('Failed to get explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const InfoSection = ({ title, content }) => {
    if (!content) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionContent}>{content}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F0F5F9' }]}>
      <View style={[styles.header, { backgroundColor: '#FFF' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{test.shortName}</Text>
        <TouchableOpacity 
          style={styles.bookmarkBtn}
          onPress={() => toggleBookmark(test.id)}
        >
          <Bookmark size={24} color={bookmarked ? "#6366F1" : "#94A3B8"} fill={bookmarked ? "#6366F1" : "transparent"} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.titleCard}>
          <Text style={styles.mainTitle}>{test.name}</Text>
          <TouchableOpacity style={styles.aiBtn} onPress={() => setShowAiModal(true)}>
            <Sparkles size={16} color="#FFF" />
            <Text style={styles.aiBtnText}>Explain Simply</Text>
          </TouchableOpacity>
        </View>

        <InfoSection title="NORMAL VALUES / FINDINGS" content={test.normalValues} />
        <InfoSection title="WHAT IT MEASURES" content={test.measures} />
        <InfoSection title="WHY IT IS IMPORTANT" content={test.importance} />
        <InfoSection title="CAUSES OF INCREASED VALUES" content={test.increasedCauses} />
        <InfoSection title="CAUSES OF DECREASED VALUES" content={test.decreasedCauses} />
        <InfoSection title="ASSOCIATED DISEASES" content={test.diseases} />
        <InfoSection title="CLINICAL SYMPTOMS" content={test.symptoms} />
        <InfoSection title="PHARMACOLOGY CORRELATION" content={test.pharmacology} />
        <InfoSection title="COMMON TREATMENT" content={test.treatment} />
        <InfoSection title="IMPORTANT EXAM POINTS" content={test.examPoints} />
        
        {test.highYield && (
          <View style={[styles.section, styles.highYieldBox]}>
            <View style={styles.hyHeader}>
              <Sparkles size={16} color="#F59E0B" />
              <Text style={styles.hyTitle}>HIGH YIELD NOTE</Text>
            </View>
            <Text style={styles.hyContent}>{test.highYield}</Text>
          </View>
        )}

        <View style={styles.disclaimerBox}>
          <AlertTriangle size={20} color="#94A3B8" style={{ marginBottom: 8 }} />
          <Text style={styles.disclaimerText}>
            Medical education reference only. Not intended for diagnosis or treatment of patients.
          </Text>
        </View>
      </ScrollView>

      {/* AI Modal */}
      <Modal visible={showAiModal} transparent animationType="slide" onRequestClose={() => setShowAiModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>AI Explainer</Text>
              <TouchableOpacity onPress={() => setShowAiModal(false)}><ChevronDown size={24} color="#64748B" /></TouchableOpacity>
            </View>

            {!aiResponse && !loading && (
              <>
                <Text style={styles.langLabel}>Select Language:</Text>
                <View style={styles.langRow}>
                  {['English', 'Hinglish', 'Malayalam'].map(l => (
                    <TouchableOpacity 
                      key={l}
                      style={[styles.langBtn, language === l && styles.langBtnActive]}
                      onPress={() => setLanguage(l)}
                    >
                      <Text style={[styles.langText, language === l && styles.langTextActive]}>{l}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.askBtn} onPress={handleAskAI}>
                  <Text style={styles.askBtnText}>Explain {test.shortName}</Text>
                </TouchableOpacity>
              </>
            )}

            {loading && (
              <View style={styles.loaderBox}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loaderText}>Simplifying medical concepts...</Text>
              </View>
            )}

            {aiError && (
              <Text style={styles.errorText}>{aiError}</Text>
            )}

            {aiResponse && !loading && (
              <ScrollView style={styles.aiResponseBox} showsVerticalScrollIndicator={false}>
                <Text style={styles.aiResponseText}>{aiResponse}</Text>
                <TouchableOpacity style={styles.resetBtn} onPress={() => setAiResponse(null)}>
                  <Text style={styles.resetBtnText}>Ask in another language</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16, 
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 10 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', flex: 1, textAlign: 'center', marginHorizontal: 10 },
  bookmarkBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 10 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  titleCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  mainTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 16 },
  aiBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6366F1', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 8 },
  aiBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  section: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#6366F1', letterSpacing: 1, marginBottom: 8 },
  sectionContent: { fontSize: 14, color: '#334155', lineHeight: 22, fontWeight: '500' },
  highYieldBox: { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' },
  hyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  hyTitle: { fontSize: 11, fontWeight: '900', color: '#D97706', letterSpacing: 1 },
  hyContent: { fontSize: 14, color: '#92400E', lineHeight: 22, fontWeight: '700' },
  disclaimerBox: { alignItems: 'center', marginTop: 20, padding: 20 },
  disclaimerText: { fontSize: 12, color: '#94A3B8', textAlign: 'center', fontStyle: 'italic', lineHeight: 18 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: '50%', maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  langLabel: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 12 },
  langRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  langBtn: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  langBtnActive: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
  langText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  langTextActive: { color: '#6366F1' },
  askBtn: { backgroundColor: '#10B981', height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  askBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  loaderBox: { alignItems: 'center', marginVertical: 40, gap: 12 },
  loaderText: { color: '#64748B', fontWeight: '600' },
  errorText: { color: '#EF4444', textAlign: 'center', marginTop: 20 },
  aiResponseBox: { marginTop: 10 },
  aiResponseText: { fontSize: 15, color: '#334155', lineHeight: 24, fontWeight: '500' },
  resetBtn: { marginTop: 24, marginBottom: 20, alignSelf: 'center' },
  resetBtnText: { color: '#6366F1', fontWeight: '700', fontSize: 14 }
});

export default DiagnosticDetailScreen;

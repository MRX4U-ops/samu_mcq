import React, { useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TextInput, 
  FlatList, TouchableOpacity, StatusBar, Alert
} from 'react-native';
import { ArrowLeft, Search, Award, Clock, XCircle, BookOpen, ChevronDown, ChevronUp } from 'lucide-react-native';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config/Constants';

// Import results
import biochemistryResults from '../data/biochemistry_results.json';
import microbiologyResults from '../data/microbiology_results.json';
import anatomyResults from '../data/clinical_anatomy_results.json';
import chemistryResults from '../data/medical_chemistry_results.json';

const SUBJECTS = [
  { id: 'biochemistry', title: 'Biochemistry 2026', data: biochemistryResults },
  { id: 'microbiology', title: 'Microbiology CBT 2026', data: microbiologyResults },
  { id: 'anatomy', title: 'Clinical Anatomy 2026', data: anatomyResults },
  { id: 'chemistry', title: 'Medical Chemistry 2026', data: chemistryResults },
];

const ExamResultsScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [query, setQuery] = useState('');
  const [activeSubjectId, setActiveSubjectId] = useState('biochemistry');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [certLoadingId, setCertLoadingId] = useState(null);

  const currentSubject = SUBJECTS.find(s => s.id === activeSubjectId) || SUBJECTS[0];

  // Filter results based on search query
  const filteredResults = useMemo(() => {
    if (!query || query.trim().length === 0) {
      return currentSubject.data;
    }
    
    const term = query.toLowerCase().trim();
    return currentSubject.data.filter(item => 
      item.name.toLowerCase().includes(term) || 
      item.group.toLowerCase().includes(term)
    );
  }, [query, currentSubject]);

  const handleCertificateClick = async (studentName, score, group) => {
    const cardId = `${studentName}-${group}`;
    setCertLoadingId(cardId);
    try {
      const response = await axios.post(`${API_URL}/certificates/generate`, {
        name: studentName,
        group: group,
        subjectId: activeSubjectId
      });
      
      // Navigate to CertificateViewScreen with certificate data
      navigation.navigate('CertificateView', { cert: response.data });
    } catch (err) {
      console.error('Failed to generate certificate:', err);
      Alert.alert(
        'Generation Failed',
        err.response?.data?.error || 'Failed to generate certificate. Please ensure the backend is running.'
      );
    } finally {
      setCertLoadingId(null);
    }
  };

  const renderItem = ({ item }) => {
    const isPassed = item.score !== null && item.score >= 60;
    const qualifiesForCertificate = item.score !== null && item.score >= 98;
    const cardId = `${item.name}-${item.group}`;
    
    return (
      <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleWrapper}>
            <BookOpen size={16} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.subjectTitle, { color: colors.text }]}>{currentSubject.title}</Text>
          </View>
          <View style={[
            styles.badge, 
            { backgroundColor: isPassed ? '#D1FAE5' : '#FEE2E2' }
          ]}>
            <Text style={[
              styles.badgeText, 
              { color: isPassed ? '#065F46' : '#991B1B' }
            ]}>
              {isPassed ? 'Passed' : 'Failed'}
            </Text>
          </View>
        </View>

        <Text style={[styles.studentName, { color: colors.text }]}>
          {item.name.replace(/\bXXX\b/g, ' ').replace(/\s+/g, ' ').trim()}
        </Text>
        <Text style={[styles.studentGroup, { color: colors.textSecondary }]}>Group: {item.group.toUpperCase()}</Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Score</Text>
            <View style={styles.scoreRow}>
              <Award size={16} color={isPassed ? '#10B981' : '#EF4444'} style={{ marginRight: 4 }} />
              <Text style={[styles.scoreValue, { color: colors.text }]}>
                {item.score !== null ? item.score.toFixed(1) : '-'}
              </Text>
            </View>
          </View>

          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Duration</Text>
            <View style={styles.scoreRow}>
              <Clock size={16} color="#94A3B8" style={{ marginRight: 4 }} />
              <Text style={[styles.durationValue, { color: colors.text }]}>{item.duration}</Text>
            </View>
          </View>
        </View>

        <View style={styles.timeInfoRow}>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            Started: {item.startTime}
          </Text>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            Finished: {item.endTime}
          </Text>
        </View>

        {qualifiesForCertificate && (
          <View style={[styles.promoCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFDF5', borderColor: '#FDE047' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Award size={18} color="#D97706" style={{ marginRight: 8 }} />
              <Text style={[styles.promoTitle, { color: isDarkMode ? '#FEF08A' : '#92400E' }]}>Outstanding Performance!</Text>
            </View>
            <Text style={[styles.promoText, { color: colors.textSecondary }]}>
              You are eligible for an Achievement Certificate.
            </Text>
            <TouchableOpacity 
              style={styles.certBtn}
              disabled={certLoadingId !== null}
              onPress={() => handleCertificateClick(item.name, item.score, item.group)}
            >
              <Text style={styles.certBtnText}>
                {certLoadingId === cardId ? 'Generating...' : '📄 View & Download Certificate'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Exam Results</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Subject Dropdown Selector */}
      <View style={{ paddingHorizontal: 20, paddingTop: 15, zIndex: 10 }}>
        <TouchableOpacity 
          style={[styles.dropdownBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9', borderColor: colors.border }]}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <BookOpen size={20} color={colors.accent} style={{ marginRight: 10 }} />
            <Text style={[styles.dropdownBtnText, { color: colors.text }]}>{currentSubject.title}</Text>
          </View>
          {isDropdownOpen ? (
            <ChevronUp size={20} color={colors.textSecondary} />
          ) : (
            <ChevronDown size={20} color={colors.textSecondary} />
          )}
        </TouchableOpacity>

        {isDropdownOpen && (
          <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {SUBJECTS.map((subj, index) => (
              <TouchableOpacity 
                key={subj.id}
                style={[
                  styles.dropdownItem, 
                  { borderBottomColor: colors.border },
                  index === SUBJECTS.length - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={() => {
                  setActiveSubjectId(subj.id);
                  setIsDropdownOpen(false);
                }}
              >
                <Text style={[
                  styles.dropdownItemText, 
                  activeSubjectId === subj.id ? { color: colors.accent, fontWeight: 'bold' } : { color: colors.text }
                ]}>
                  {subj.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Search Box */}
      <View style={[styles.searchContainer, { zIndex: 1 }]}>
        <View style={[styles.searchBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
          <Search size={20} color="#94A3B8" />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Search your name or group..."
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Results List */}
      <FlatList
        data={filteredResults}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        initialNumToRender={15}
        maxToRenderPerBatch={20}
        windowSize={10}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <XCircle size={48} color="#EF4444" style={{ marginBottom: 15 }} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No records found</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              {query.trim().length > 0 
                ? `We couldn't find any results matching "${query}".`
                : "No results currently available."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 25,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownList: {
    position: 'absolute',
    top: 75,
    left: 20,
    right: 20,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    zIndex: 100,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBox: {
    height: 50,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: { padding: 20, paddingBottom: 40 },
  resultCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studentGroup: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  durationValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  timeInfoRow: {
    flexDirection: 'column',
    gap: 2,
    marginBottom: 10,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyBox: {
    marginTop: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Promo card styling for certificates
  promoCard: {
    marginTop: 15,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  promoText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 16,
  },
  certBtn: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  certBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default ExamResultsScreen;

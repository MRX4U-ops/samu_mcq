import React, { useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TextInput, 
  FlatList, TouchableOpacity, StatusBar
} from 'react-native';
import { ArrowLeft, Search, Award, Clock, XCircle, BookOpen, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import biochemistryResults from '../data/biochemistry_results.json';
import microbiologyResults from '../data/microbiology_results.json';
import anatomyResults from '../data/clinical_anatomy_results.json';

const SUBJECTS = [
  { id: 'biochemistry', title: 'Biochemistry 2026', data: biochemistryResults },
  { id: 'microbiology', title: 'Microbiology CBT 2026', data: microbiologyResults },
  { id: 'anatomy', title: 'Clinical Anatomy 2026', data: anatomyResults },
];

const ExamResultsScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [query, setQuery] = useState('');
  const [activeSubjectId, setActiveSubjectId] = useState('biochemistry');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const renderItem = ({ item }) => {
    const isPassed = item.score !== null && item.score >= 60;
    
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

        <Text style={[styles.studentName, { color: colors.text }]}>{item.name}</Text>
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
});

export default ExamResultsScreen;


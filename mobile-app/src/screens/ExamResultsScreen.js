import React, { useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TextInput, 
  FlatList, TouchableOpacity, StatusBar, ActivityIndicator 
} from 'react-native';
import { ArrowLeft, Search, Award, Clock, CheckCircle2, XCircle, BookOpen } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import biochemistryResults from '../data/biochemistry_results.json';

const ExamResultsScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [query, setQuery] = useState('');

  // Filter results based on search query
  const filteredResults = useMemo(() => {
    if (!query || query.trim().length < 2) return [];
    
    const term = query.toLowerCase().trim();
    return biochemistryResults.filter(item => 
      item.name.toLowerCase().includes(term) || 
      item.group.toLowerCase().includes(term)
    );
  }, [query]);

  const renderItem = ({ item }) => {
    const isPassed = item.score !== null && item.score >= 60;
    
    return (
      <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleWrapper}>
            <BookOpen size={16} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.subjectTitle, { color: colors.text }]}>Biochemistry 2026</Text>
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

      {/* Search Box */}
      <View style={styles.searchContainer}>
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
        ListEmptyComponent={
          query.trim().length >= 2 ? (
            <View style={styles.emptyBox}>
              <XCircle size={48} color="#EF4444" style={{ marginBottom: 15 }} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No records found</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                We couldn't find any results matching "{query}". Make sure the name is spelled correctly.
              </Text>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Award size={48} color={colors.accent} style={{ marginBottom: 15 }} />
              <Text style={[styles.emptyText, { color: colors.text }]}>Find Your Exam Result</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Type at least 2 characters of your name or group to view your official Biochemistry 2026 score.
              </Text>
            </View>
          )
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

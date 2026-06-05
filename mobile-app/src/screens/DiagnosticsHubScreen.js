import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Keyboard } from 'react-native';
import { ArrowLeft, Search, Clock, ChevronRight, Bookmark } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { CLINICAL_CATEGORIES, CLINICAL_DATA } from '../data/clinicalData';
import useDiagnosticsStore from '../store/diagnosticsStore';

// Dynamic icon mapping for categories
import * as LucideIcons from 'lucide-react-native';

const DiagnosticsHubScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const { recentSearches, initialize, addRecentSearch, clearRecentSearches, bookmarks } = useDiagnosticsStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      const results = CLINICAL_DATA.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.shortName.toLowerCase().includes(q) ||
        item.diseases.toLowerCase().includes(q)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleTestSelect = (test) => {
    Keyboard.dismiss();
    addRecentSearch(test.shortName);
    navigation.navigate('DiagnosticDetail', { test });
  };

  const handleCategorySelect = (category) => {
    navigation.navigate('DiagnosticCategory', { category });
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
    }
  };

  const handleRecentSelect = (query) => {
    setSearchQuery(query);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F0F5F9' }]}>
      <View style={[styles.header, { backgroundColor: '#FFF' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diagnostics Hub</Text>
        <TouchableOpacity 
          style={styles.bookmarkBtn}
          onPress={() => navigation.navigate('DiagnosticCategory', { isBookmarks: true })}
        >
          <Bookmark size={20} color={bookmarks.length > 0 ? "#6366F1" : "#94A3B8"} fill={bookmarks.length > 0 ? "#6366F1" : "transparent"} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tests, diseases, e.g. CBC, LFT, STEMI..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results */}
        {searchQuery.trim().length > 1 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>SEARCH RESULTS</Text>
            {searchResults.length > 0 ? (
              searchResults.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.resultItem}
                  onPress={() => handleTestSelect(item)}
                >
                  <View>
                    <Text style={styles.resultName}>{item.shortName}</Text>
                    <Text style={styles.resultDesc} numberOfLines={1}>{item.name}</Text>
                  </View>
                  <ChevronRight size={18} color="#94A3B8" />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
            )}
          </View>
        )}

        {/* Default View (Categories & Recents) */}
        {searchQuery.trim().length <= 1 && (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>RECENT SEARCHES</Text>
                  <TouchableOpacity onPress={clearRecentSearches}>
                    <Text style={styles.clearRecentBtn}>Clear</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.recentChips}>
                  {recentSearches.map((term, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.recentChip}
                      onPress={() => handleRecentSelect(term)}
                    >
                      <Clock size={12} color="#64748B" />
                      <Text style={styles.recentChipText}>{term}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Main Categories */}
            <View style={styles.categoriesSection}>
              <Text style={styles.sectionTitle}>MAIN CATEGORIES</Text>
              <View style={styles.grid}>
                {CLINICAL_CATEGORIES.map(cat => {
                  const Icon = LucideIcons[cat.icon] || LucideIcons.FileText;
                  return (
                    <TouchableOpacity 
                      key={cat.id} 
                      style={styles.categoryCard}
                      onPress={() => handleCategorySelect(cat)}
                    >
                      <View style={[styles.iconBox, { backgroundColor: cat.color + '15' }]}>
                        <Icon size={28} color={cat.color} />
                      </View>
                      <Text style={styles.categoryTitle}>{cat.title}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  bookmarkBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 10 },
  searchSection: { padding: 16, backgroundColor: '#FFF' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B', fontWeight: '500' },
  clearText: { color: '#94A3B8', fontWeight: '600', fontSize: 13 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#94A3B8', letterSpacing: 1, marginLeft: 16, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 },
  clearRecentBtn: { fontSize: 12, color: '#EF4444', fontWeight: '600', marginBottom: 12 },
  recentSection: { marginTop: 20 },
  recentChips: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  recentChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 20, 
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  recentChipText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  categoriesSection: { marginTop: 24, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  categoryCard: {
    width: '46%',
    backgroundColor: '#FFF',
    margin: '2%',
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', textAlign: 'center', lineHeight: 20 },
  resultsContainer: { marginTop: 20, paddingHorizontal: 16 },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  resultName: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  resultDesc: { fontSize: 13, color: '#64748B', marginTop: 4 },
  noResultsText: { textAlign: 'center', color: '#94A3B8', marginTop: 20, fontStyle: 'italic' }
});

export default DiagnosticsHubScreen;

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, FlatList, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { ArrowLeft, Search as SearchIcon, X, BookOpen, ChevronRight, Lock } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { ALL_SUBJECTS } from '../data/subjectData';
import useAuthStore from '../store/authStore';

const SearchScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [query, setQuery] = useState('');
  const { subscription, profile } = useAuthStore();
  const isSubscribed = !!subscription || profile?.role === 'admin';
  
  const filteredResults = ALL_SUBJECTS.filter(item => 
    item.title.toLowerCase().replace(/[^a-z0-9]/g, '').includes(query.toLowerCase().replace(/[^a-z0-9]/g, ''))
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={[styles.searchBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
          <SearchIcon size={20} color="#94A3B8" />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Search subjects or topics..."
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={query.length > 0 ? filteredResults : []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.resultItem, { backgroundColor: colors.surface }]}
            onPress={() => {
              if (!isSubscribed) {
                Alert.alert(
                  "Subscription Required",
                  "Please subscribe to unlock access to all courses and content.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Subscribe Now", onPress: () => navigation.navigate('Subscription') }
                  ]
                );
              } else {
                navigation.navigate('Topic', { 
                  subjectId: item.id, 
                  title: item.title, 
                  courseTitle: item.course 
                });
              }
            }}
          >
            <View style={[styles.iconWrapper, { backgroundColor: colors.accent + '15' }]}>
              <BookOpen size={20} color={colors.accent} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={styles.itemType}>{item.course}</Text>
            </View>
            {isSubscribed ? (
              <ChevronRight size={18} color="#94A3B8" />
            ) : (
              <Lock size={16} color="#EF4444" />
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query.length > 0 ? (
            <View style={styles.emptyBox}>
              <Text style={{ color: colors.textSecondary }}>No results found for "{query}"</Text>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <SearchIcon size={48} color="#E2E8F0" style={{ marginBottom: 15 }} />
              <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
                Search through 131+ subjects and thousands of medical topics instantly.
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
    alignItems: 'center',
    padding: 15,
    paddingTop: 25, // Move downward
    borderBottomWidth: 1,
  },
  backBtn: { padding: 5, marginRight: 10 },
  searchBox: {
    flex: 1,
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
  listContent: { padding: 20 },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 1,
  },
  iconWrapper: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: 'bold' },
  itemType: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  emptyBox: { marginTop: 100, alignItems: 'center', paddingHorizontal: 50 },
});

export default SearchScreen;

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, ChevronRight, Stethoscope } from 'lucide-react-native';
import { CLINICAL_DATA } from '../data/clinicalData';
import useDiagnosticsStore from '../store/diagnosticsStore';

const DiagnosticCategoryScreen = ({ route, navigation }) => {
  const { category, isBookmarks } = route.params || {};
  const { bookmarks } = useDiagnosticsStore();

  let items = [];
  let screenTitle = '';

  if (isBookmarks) {
    screenTitle = 'Saved Diagnostics';
    items = CLINICAL_DATA.filter(item => bookmarks.includes(item.id));
  } else if (category) {
    screenTitle = category.title;
    items = CLINICAL_DATA.filter(item => item.category === category.id);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F0F5F9' }]}>
      <View style={[styles.header, { backgroundColor: '#FFF' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Stethoscope size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No items found</Text>
            {isBookmarks && <Text style={styles.emptySub}>You haven't bookmarked any tests yet.</Text>}
          </View>
        ) : (
          items.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.itemCard}
              onPress={() => navigation.navigate('DiagnosticDetail', { test: item })}
            >
              <View style={styles.itemLeft}>
                <View style={styles.iconBox}>
                  <Text style={styles.shortNameText}>{item.shortName.slice(0, 3).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDesc} numberOfLines={2}>{item.measures || item.importance}</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#94A3B8" />
            </TouchableOpacity>
          ))
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
  scrollContent: { padding: 16, paddingBottom: 40 },
  emptyState: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#64748B', marginTop: 16 },
  emptySub: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginTop: 8 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  shortNameText: { color: '#6366F1', fontWeight: '900', fontSize: 12 },
  itemName: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  itemDesc: { fontSize: 12, color: '#64748B', lineHeight: 16 }
});

export default DiagnosticCategoryScreen;

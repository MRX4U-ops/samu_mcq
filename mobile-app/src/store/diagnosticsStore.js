import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useDiagnosticsStore = create((set, get) => ({
  bookmarks: [],
  recentSearches: [],
  
  initialize: async () => {
    try {
      const storedBookmarks = await AsyncStorage.getItem('diag_bookmarks');
      const storedRecents = await AsyncStorage.getItem('diag_recents');
      
      if (storedBookmarks) set({ bookmarks: JSON.parse(storedBookmarks) });
      if (storedRecents) set({ recentSearches: JSON.parse(storedRecents) });
    } catch (e) {
      console.log('Error initializing diagnostics store:', e);
    }
  },

  toggleBookmark: async (testId) => {
    try {
      const { bookmarks } = get();
      const isBookmarked = bookmarks.includes(testId);
      
      const newBookmarks = isBookmarked 
        ? bookmarks.filter(id => id !== testId)
        : [...bookmarks, testId];
        
      set({ bookmarks: newBookmarks });
      await AsyncStorage.setItem('diag_bookmarks', JSON.stringify(newBookmarks));
    } catch (e) {
      console.log('Error toggling bookmark:', e);
    }
  },

  isBookmarked: (testId) => {
    return get().bookmarks.includes(testId);
  },

  addRecentSearch: async (query) => {
    if (!query || query.trim() === '') return;
    
    try {
      const { recentSearches } = get();
      const cleanQuery = query.trim();
      
      // Remove it if it already exists so we can bump it to the front
      const filtered = recentSearches.filter(s => s.toLowerCase() !== cleanQuery.toLowerCase());
      
      // Keep only last 10 searches
      const newRecents = [cleanQuery, ...filtered].slice(0, 10);
      
      set({ recentSearches: newRecents });
      await AsyncStorage.setItem('diag_recents', JSON.stringify(newRecents));
    } catch (e) {
      console.log('Error adding recent search:', e);
    }
  },

  clearRecentSearches: async () => {
    try {
      set({ recentSearches: [] });
      await AsyncStorage.removeItem('diag_recents');
    } catch (e) {
      console.log('Error clearing recent searches:', e);
    }
  }
}));

export default useDiagnosticsStore;

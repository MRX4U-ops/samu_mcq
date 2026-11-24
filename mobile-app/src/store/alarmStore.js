import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAlarmStore = create((set, get) => ({
  exams: [],
  alarms: [],
  loading: false,

  initialize: async (userId) => {
    try {
      if (!userId) return;
      const stored = await AsyncStorage.getItem(`samu_exams_${userId}`);
      if (stored) {
        set({ exams: JSON.parse(stored) });
      }
    } catch (e) {
      console.warn('Failed to load alarms:', e.message);
    }
  },

  setExams: (exams) => set({ exams }),
}));

export default useAlarmStore;

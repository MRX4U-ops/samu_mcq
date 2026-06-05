import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Vibration } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import { API_URL } from '../config/Constants';

let Notifications = null;
if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
  } catch (e) {
    console.log('expo-notifications not available');
  }
}

// Global audio/vibration references
let soundInstance = null;
let vibrationInterval = null;
let timerInterval = null;

const CACHE_KEYS = {
  ALARMS: '@study_alarms_cache',
  EXAMS: '@exam_reminders_cache',
  TIMER: '@study_timer_cache',
};

// Day mapping for notifications
const DAY_MAP = {
  'Mon': 2, 'Monday': 2,
  'Tue': 3, 'Tuesday': 3,
  'Wed': 4, 'Wednesday': 4,
  'Thu': 5, 'Thursday': 5,
  'Fri': 6, 'Friday': 6,
  'Sat': 7, 'Saturday': 7,
  'Sun': 1, 'Sunday': 1,
};

const parseTime = (timeStr) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return { hour: hours, minute: minutes };
};

const useAlarmStore = create((set, get) => ({
  alarms: [],
  exams: [],
  activeAlarm: null,
  
  // Timer State
  timerSeconds: 1500, // 25 min default
  timerDuration: 1500,
  isTimerRunning: false,
  timerMode: 'pomodoro', // 'pomodoro', 'short_break', 'long_break', 'custom'

  loading: false,
  error: null,

  // Initialize store and load data
  initialize: async (userId) => {
    set({ loading: true });
    try {
      // 1. Load from cache
      const cachedAlarms = await AsyncStorage.getItem(CACHE_KEYS.ALARMS);
      const cachedExams = await AsyncStorage.getItem(CACHE_KEYS.EXAMS);
      const cachedTimer = await AsyncStorage.getItem(CACHE_KEYS.TIMER);

      if (cachedAlarms) set({ alarms: JSON.parse(cachedAlarms) });
      if (cachedExams) set({ exams: JSON.parse(cachedExams) });
      if (cachedTimer) {
        const timerData = JSON.parse(cachedTimer);
        set({
          timerSeconds: timerData.seconds,
          timerDuration: timerData.duration,
          timerMode: timerData.mode
        });
      }

      // 2. Fetch from DB if online
      if (userId) {
        await get().fetchAlarms(userId);
        await get().fetchExams(userId);
      }
    } catch (e) {
      console.log('Error initializing alarmStore:', e.message);
    } finally {
      set({ loading: false });
    }
  },

  // Fetch alarms from Backend
  fetchAlarms: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/alarms`, {
        headers: { 'user-id': userId }
      });
      
      let data = response.data;
      if (data && data.isFallback) {
        data = data.data; // unwrap fallback
      }
      
      if (Array.isArray(data)) {
        set({ alarms: data });
        await AsyncStorage.setItem(CACHE_KEYS.ALARMS, JSON.stringify(data));
      }
    } catch (e) {
      console.log('Fetch alarms failed, using cached list:', e.message);
    }
  },

  // Save or update an alarm
  saveAlarm: async (userId, alarmData) => {
    set({ loading: true });
    const { alarms } = get();
    const isEdit = !!alarmData.id && !alarmData.id.startsWith('fallback-');
    
    try {
      let savedAlarm;
      
      if (alarmData.id) {
        // Update
        const response = await axios.put(`${API_URL}/users/alarms/${alarmData.id}`, alarmData, {
          headers: { 'user-id': userId }
        });
        
        let data = response.data;
        if (data && data.isFallback) {
          savedAlarm = { ...alarmData };
        } else {
          savedAlarm = data;
        }
      } else {
        // Create
        const response = await axios.post(`${API_URL}/users/alarms`, alarmData, {
          headers: { 'user-id': userId }
        });
        
        let data = response.data;
        if (data && data.isFallback) {
          savedAlarm = data.data;
        } else {
          savedAlarm = data;
        }
      }

      // Update Local State
      let updatedAlarms;
      if (alarmData.id) {
        updatedAlarms = alarms.map(a => a.id === alarmData.id ? savedAlarm : a);
      } else {
        updatedAlarms = [...alarms, savedAlarm];
      }

      set({ alarms: updatedAlarms });
      await AsyncStorage.setItem(CACHE_KEYS.ALARMS, JSON.stringify(updatedAlarms));

      // Re-schedule notifications for this alarm
      await get().scheduleAlarmNotifications(savedAlarm);

      return { success: true, alarm: savedAlarm };
    } catch (e) {
      console.log('Save alarm error (falling back to offline cache):', e.message);
      
      // Fallback local saving
      const localId = alarmData.id || 'fallback-' + Date.now();
      const localAlarm = {
        id: localId,
        user_id: userId,
        title: alarmData.title,
        time: alarmData.time,
        repeat_type: alarmData.repeat_type,
        days_of_week: alarmData.days_of_week || [],
        ringtone_enabled: alarmData.ringtone_enabled !== undefined ? alarmData.ringtone_enabled : true,
        vibration_enabled: alarmData.vibration_enabled !== undefined ? alarmData.vibration_enabled : true,
        is_active: alarmData.is_active !== undefined ? alarmData.is_active : true,
        created_at: alarmData.created_at || new Date().toISOString()
      };

      let updatedAlarms;
      if (alarmData.id) {
        updatedAlarms = alarms.map(a => a.id === alarmData.id ? localAlarm : a);
      } else {
        updatedAlarms = [...alarms, localAlarm];
      }

      set({ alarms: updatedAlarms });
      await AsyncStorage.setItem(CACHE_KEYS.ALARMS, JSON.stringify(updatedAlarms));
      await get().scheduleAlarmNotifications(localAlarm);

      return { success: true, alarm: localAlarm, isOffline: true };
    } finally {
      set({ loading: false });
    }
  },

  // Delete an alarm
  deleteAlarm: async (userId, alarmId) => {
    const { alarms } = get();
    const alarmToDelete = alarms.find(a => a.id === alarmId);
    
    // Cancel notifications first
    if (alarmToDelete) {
      await get().cancelAlarmNotifications(alarmToDelete);
    }

    try {
      const isFallback = alarmId.startsWith('fallback-');
      if (!isFallback) {
        await axios.delete(`${API_URL}/users/alarms/${alarmId}`, {
          headers: { 'user-id': userId }
        });
      }
    } catch (e) {
      console.log('Delete alarm from remote failed, removing locally:', e.message);
    }

    const updatedAlarms = alarms.filter(a => a.id !== alarmId);
    set({ alarms: updatedAlarms });
    await AsyncStorage.setItem(CACHE_KEYS.ALARMS, JSON.stringify(updatedAlarms));
  },

  // Toggle active status
  toggleAlarm: async (userId, alarmId) => {
    const { alarms } = get();
    const alarm = alarms.find(a => a.id === alarmId);
    if (!alarm) return;

    const updatedAlarm = { ...alarm, is_active: !alarm.is_active };
    
    // Cancel or schedule
    if (updatedAlarm.is_active) {
      await get().scheduleAlarmNotifications(updatedAlarm);
    } else {
      await get().cancelAlarmNotifications(updatedAlarm);
    }

    // Save
    try {
      const isFallback = alarmId.startsWith('fallback-');
      if (!isFallback) {
        await axios.put(`${API_URL}/users/alarms/${alarmId}`, updatedAlarm, {
          headers: { 'user-id': userId }
        });
      }
    } catch (e) {
      console.log('Toggle alarm remote sync failed, saved locally:', e.message);
    }

    const updatedAlarms = alarms.map(a => a.id === alarmId ? updatedAlarm : a);
    set({ alarms: updatedAlarms });
    await AsyncStorage.setItem(CACHE_KEYS.ALARMS, JSON.stringify(updatedAlarms));
  },

  // Schedule Notifications
  scheduleAlarmNotifications: async (alarm) => {
    if (!Notifications || Platform.OS === 'web' || !alarm.is_active) return;

    // First cancel existing
    await get().cancelAlarmNotifications(alarm);

    const { hour, minute } = parseTime(alarm.time);
    const notificationIds = [];

    try {
      const content = {
        title: `📚 ${alarm.title || 'Study Practice Alarm'}`,
        body: '🔥 Time to practice MCQs! Your daily streak is waiting.',
        data: { screen: 'Alarm', alarmId: alarm.id, action: 'trigger_alarm' },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      };

      if (alarm.repeat_type === 'daily') {
        const id = await Notifications.scheduleNotificationAsync({
          content,
          trigger: { hour, minute, repeats: true }
        });
        notificationIds.push(id);
      } else if (alarm.repeat_type === 'weekly') {
        // Weekly on current day of week
        const today = new Date();
        const weekday = today.getDay() + 1; // JS 0-6 (Sun-Sat) to Expo 1-7 (Sun-Sat)
        const id = await Notifications.scheduleNotificationAsync({
          content,
          trigger: { weekday, hour, minute, repeats: true }
        });
        notificationIds.push(id);
      } else if (alarm.repeat_type === 'custom' && Array.isArray(alarm.days_of_week)) {
        for (const day of alarm.days_of_week) {
          const weekday = DAY_MAP[day] || DAY_MAP[day.substring(0, 3)];
          if (weekday) {
            const id = await Notifications.scheduleNotificationAsync({
              content,
              trigger: { weekday, hour, minute, repeats: true }
            });
            notificationIds.push(id);
          }
        }
      }

      // Store notifications mapping locally so we can cancel them later
      const alarmNotificationKeys = `@alarm_notifs_${alarm.id}`;
      await AsyncStorage.setItem(alarmNotificationKeys, JSON.stringify(notificationIds));
    } catch (e) {
      console.log('Failed to schedule notification:', e.message);
    }
  },

  cancelAlarmNotifications: async (alarm) => {
    if (!Notifications || Platform.OS === 'web') return;

    try {
      const alarmNotificationKeys = `@alarm_notifs_${alarm.id}`;
      const savedIds = await AsyncStorage.getItem(alarmNotificationKeys);
      if (savedIds) {
        const ids = JSON.parse(savedIds);
        for (const id of ids) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
        await AsyncStorage.removeItem(alarmNotificationKeys);
      }
    } catch (e) {
      console.log('Failed to cancel notifications:', e.message);
    }
  },

  // --- EXAM REMINDERS ACTIONS ---
  fetchExams: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/exams`, {
        headers: { 'user-id': userId }
      });
      
      let data = response.data;
      if (data && data.isFallback) {
        data = data.data;
      }
      
      if (Array.isArray(data)) {
        set({ exams: data });
        await AsyncStorage.setItem(CACHE_KEYS.EXAMS, JSON.stringify(data));
      }
    } catch (e) {
      console.log('Fetch exams failed, using cached list:', e.message);
    }
  },

  saveExam: async (userId, examData) => {
    set({ loading: true });
    const { exams } = get();

    try {
      let savedExam;
      const response = await axios.post(`${API_URL}/users/exams`, examData, {
        headers: { 'user-id': userId }
      });
      
      let data = response.data;
      if (data && data.isFallback) {
        savedExam = data.data;
      } else {
        savedExam = data;
      }

      const updatedExams = [...exams, savedExam];
      set({ exams: updatedExams });
      await AsyncStorage.setItem(CACHE_KEYS.EXAMS, JSON.stringify(updatedExams));

      // Schedule exam alerts
      await get().scheduleExamNotifications(savedExam);

      return { success: true, exam: savedExam };
    } catch (e) {
      console.log('Save exam failed (offline mode):', e.message);
      
      const localExam = {
        id: 'fallback-' + Date.now(),
        user_id: userId,
        subject: examData.subject,
        exam_date: examData.exam_date,
        notes: examData.notes,
        created_at: new Date().toISOString()
      };

      const updatedExams = [...exams, localExam];
      set({ exams: updatedExams });
      await AsyncStorage.setItem(CACHE_KEYS.EXAMS, JSON.stringify(updatedExams));
      await get().scheduleExamNotifications(localExam);

      return { success: true, exam: localExam, isOffline: true };
    } finally {
      set({ loading: false });
    }
  },

  deleteExam: async (userId, examId) => {
    const { exams } = get();
    const examToDelete = exams.find(e => e.id === examId);
    
    if (examToDelete) {
      await get().cancelExamNotifications(examToDelete);
    }

    try {
      const isFallback = examId.startsWith('fallback-');
      if (!isFallback) {
        await axios.delete(`${API_URL}/users/exams/${examId}`, {
          headers: { 'user-id': userId }
        });
      }
    } catch (e) {
      console.log('Delete exam from remote failed, removing locally:', e.message);
    }

    const updatedExams = exams.filter(e => e.id !== examId);
    set({ exams: updatedExams });
    await AsyncStorage.setItem(CACHE_KEYS.EXAMS, JSON.stringify(updatedExams));
  },

  scheduleExamNotifications: async (exam) => {
    if (!Notifications || Platform.OS === 'web') return;

    await get().cancelExamNotifications(exam);

    const examTime = new Date(exam.exam_date).getTime();
    const now = Date.now();
    const notificationIds = [];

    const scheduleAlert = async (targetTime, title, body) => {
      if (targetTime > now) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: { screen: 'ExamReminder', examId: exam.id },
            sound: true,
          },
          trigger: new Date(targetTime),
        });
        notificationIds.push(id);
      }
    };

    try {
      // 1. 3 days before at 9:00 AM
      const threeDaysBefore = examTime - 3 * 24 * 60 * 60 * 1000;
      const t3 = new Date(threeDaysBefore);
      t3.setHours(9, 0, 0, 0);
      await scheduleAlert(t3.getTime(), `⏳ ${exam.subject} Exam in 3 Days`, `Make sure you study! Notes: ${exam.notes || ''}`);

      // 2. 1 day before (tomorrow) at 9:00 AM
      const oneDayBefore = examTime - 24 * 60 * 60 * 1000;
      const t1 = new Date(oneDayBefore);
      t1.setHours(9, 0, 0, 0);
      await scheduleAlert(t1.getTime(), `🚨 ${exam.subject} Tomorrow!`, `Last day to prepare. All the best!`);

      // Save notification IDs
      const examNotificationKeys = `@exam_notifs_${exam.id}`;
      await AsyncStorage.setItem(examNotificationKeys, JSON.stringify(notificationIds));
    } catch (e) {
      console.log('Failed to schedule exam notification:', e.message);
    }
  },

  cancelExamNotifications: async (exam) => {
    if (!Notifications || Platform.OS === 'web') return;

    try {
      const examNotificationKeys = `@exam_notifs_${exam.id}`;
      const savedIds = await AsyncStorage.getItem(examNotificationKeys);
      if (savedIds) {
        const ids = JSON.parse(savedIds);
        for (const id of ids) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
        await AsyncStorage.removeItem(examNotificationKeys);
      }
    } catch (e) {
      console.log('Failed to cancel exam notifications:', e.message);
    }
  },

  // --- PLAYBACK CONTROL (RINGTONE & VIBRATION) ---

  triggerAlarm: async (alarmId) => {
    const { alarms } = get();
    const alarm = alarms.find(a => a.id === alarmId);
    if (!alarm) return;

    set({ activeAlarm: alarm });
    await get().startAlarmPlayback(alarm.ringtone_enabled, alarm.vibration_enabled);
  },

  startAlarmPlayback: async (ringtoneEnabled, vibrationEnabled) => {
    await get().stopAlarmPlayback();

    // Configure Audio Mode to play looping ringtone
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldRouteThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (e) {
      console.log('Set audio mode failed:', e.message);
    }

    if (ringtoneEnabled) {
      try {
        const { Sound } = Audio;
        soundInstance = new Sound();
        // Load the downloaded alarm.wav file
        await soundInstance.loadAsync(require('../../assets/alarm.wav'));
        await soundInstance.setIsLoopingAsync(true);
        await soundInstance.playAsync();
        console.log('Playing alarm.wav looping ringtone');
      } catch (e) {
        console.log('Error playing ringtone:', e.message);
      }
    }

    if (vibrationEnabled) {
      Vibration.vibrate([1000, 1000], true);
      vibrationInterval = setInterval(() => {
        Vibration.vibrate([1000, 1000], true);
      }, 4000);
    }
  },

  stopAlarmPlayback: async () => {
    if (soundInstance) {
      try {
        await soundInstance.stopAsync();
        await soundInstance.unloadAsync();
      } catch (e) {
        console.log('Error unloading sound:', e.message);
      }
      soundInstance = null;
    }
    if (vibrationInterval) {
      clearInterval(vibrationInterval);
      vibrationInterval = null;
    }
    Vibration.cancel();
  },

  dismissAlarm: async () => {
    await get().stopAlarmPlayback();
    set({ activeAlarm: null });
  },

  snoozeAlarm: async () => {
    const { activeAlarm } = get();
    await get().stopAlarmPlayback();
    set({ activeAlarm: null });

    if (activeAlarm && Notifications && Platform.OS !== 'web') {
      try {
        // Schedule a snooze notification 5 minutes from now
        const snoozeDuration = activeAlarm.snooze_duration || 5;
        const triggerTime = Date.now() + snoozeDuration * 60 * 1000;
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `⏰ Snooze: ${activeAlarm.title || 'Study Practice'}`,
            body: `Practice session was snoozed for ${snoozeDuration} mins. Let's do it now!`,
            data: { screen: 'Alarm', alarmId: activeAlarm.id, action: 'trigger_alarm' },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: new Date(triggerTime),
        });
        console.log(`Scheduled snooze notification in ${snoozeDuration} minutes.`);
      } catch (e) {
        console.log('Failed to schedule snooze notification:', e.message);
      }
    }
  },

  // --- STUDY POMODORO TIMER SYSTEM ---

  startTimer: (duration, mode = 'pomodoro') => {
    // Clear any existing
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    set({
      timerDuration: duration,
      timerSeconds: duration,
      isTimerRunning: true,
      timerMode: mode
    });

    timerInterval = setInterval(async () => {
      const { timerSeconds, isTimerRunning, timerMode } = get();
      if (!isTimerRunning) return;

      if (timerSeconds <= 1) {
        // Timer Finished!
        clearInterval(timerInterval);
        timerInterval = null;
        set({ isTimerRunning: false, timerSeconds: 0 });

        // Play standard alert audio & trigger notifications
        if (Notifications && Platform.OS !== 'web') {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: timerMode === 'pomodoro' ? '⏰ Pomodoro Finished!' : '☕ Break Finished!',
              body: timerMode === 'pomodoro' ? 'Good job! Time to take a break.' : 'Time to get back to studying.',
              sound: true,
            },
            trigger: null,
          });
        }
        
        // Ring for a bit
        await get().startAlarmPlayback(true, true);
        setTimeout(async () => {
          await get().stopAlarmPlayback();
        }, 8000); // Ring for 8 seconds
        
      } else {
        const nextSeconds = timerSeconds - 1;
        set({ timerSeconds: nextSeconds });
        
        // Cache progress periodically
        if (nextSeconds % 5 === 0) {
          await AsyncStorage.setItem(CACHE_KEYS.TIMER, JSON.stringify({
            seconds: nextSeconds,
            duration,
            mode
          }));
        }
      }
    }, 1000);
  },

  pauseTimer: () => {
    set({ isTimerRunning: false });
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  },

  resumeTimer: () => {
    const { timerSeconds, timerDuration, timerMode } = get();
    get().startTimer(timerSeconds, timerMode);
    // Restore duration to initial
    set({ timerDuration });
  },

  resetTimer: async () => {
    set({ isTimerRunning: false, timerSeconds: 1500, timerDuration: 1500, timerMode: 'pomodoro' });
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    await AsyncStorage.removeItem(CACHE_KEYS.TIMER);
  },
  
  setTimerSeconds: (secs) => {
    set({ timerSeconds: secs, timerDuration: secs });
  }

}));

export default useAlarmStore;

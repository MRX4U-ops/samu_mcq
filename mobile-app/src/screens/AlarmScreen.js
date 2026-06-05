import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, Animated, Modal, Platform } from 'react-native';
import { ArrowLeft, Plus, Clock, Trash2, Bell, Volume2, Smartphone, ShieldAlert, BookOpen, Calendar, Timer } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import useAlarmStore from '../store/alarmStore';
import useAuthStore from '../store/authStore';
import { LinearGradient } from 'expo-linear-gradient';

const AlarmScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuthStore();
  const { 
    alarms, 
    activeAlarm, 
    initialize, 
    toggleAlarm, 
    deleteAlarm, 
    dismissAlarm, 
    snoozeAlarm,
    exams
  } = useAlarmStore();

  // Pulse animation for active alarm overlay
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (user) {
      initialize(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (activeAlarm) {
      // Loop pulse animation when active alarm fires
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [activeAlarm]);

  // Find next upcoming exam for the countdown card
  const getNextExam = () => {
    if (!exams || exams.length === 0) return null;
    const now = Date.now();
    const futureExams = exams
      .filter(e => new Date(e.exam_date).getTime() > now)
      .sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime());
    return futureExams[0] || null;
  };

  const nextExam = getNextExam();
  
  const getDaysRemaining = (dateStr) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Active Alarm Overlay Modal */}
      <Modal
        visible={!!activeAlarm}
        transparent={false}
        animationType="slide"
        onRequestClose={dismissAlarm}
      >
        <LinearGradient
          colors={['#1E1B4B', '#0F172A', '#311042']}
          style={styles.modalGradient}
        >
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ShieldAlert size={32} color="#EF4444" />
              <Text style={styles.modalHeaderTitle}>STUDY ALERT</Text>
            </View>

            <View style={styles.modalBody}>
              <Animated.View style={[styles.bellContainer, { transform: [{ scale: pulseAnim }] }]}>
                <LinearGradient
                  colors={['#EF4444', '#EC4899']}
                  style={styles.bellGradient}
                >
                  <Bell size={64} color="#FFF" />
                </LinearGradient>
              </Animated.View>

              <Text style={styles.modalAlarmTitle}>
                {activeAlarm?.title || 'Time to practice MCQs!'}
              </Text>
              <Text style={styles.modalAlarmTime}>{activeAlarm?.time}</Text>
              <Text style={styles.modalAlarmBody}>
                🔥 Keep your daily streak alive. Consistency is the key to medical mastery.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.snoozeBtn]} 
                onPress={snoozeAlarm}
              >
                <Text style={styles.snoozeBtnText}>Snooze (5m)</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalBtn, styles.dismissBtn]} 
                onPress={dismissAlarm}
              >
                <Text style={styles.dismissBtnText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Modal>

      {/* Screen Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Study Planner</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('AddAlarm')} 
          style={styles.addBtn}
        >
          <Plus size={24} color="#FF9F0A" />
        </TouchableOpacity>
      </View>

      {/* Segmented Control Navigation */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity style={[styles.segmentBtn, styles.segmentActive, { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' }]}>
          <Bell size={16} color="#FF9F0A" />
          <Text style={[styles.segmentText, { color: colors.text }]}>Alarms</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.segmentBtn}
          onPress={() => navigation.navigate('ExamReminder')}
        >
          <Calendar size={16} color={colors.textSecondary} />
          <Text style={[styles.segmentText, { color: colors.textSecondary }]}>Exams</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.segmentBtn}
          onPress={() => navigation.navigate('StudyTimer')}
        >
          <Timer size={16} color={colors.textSecondary} />
          <Text style={[styles.segmentText, { color: colors.textSecondary }]}>Timer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Next Exam Countdown Card */}
        {nextExam && (
          <LinearGradient
            colors={['#4F46E5', '#312E81']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.countdownCard}
          >
            <View style={styles.countdownHeader}>
              <Text style={styles.countdownTag}>⏳ UPCOMING EXAM</Text>
              <Text style={styles.countdownDays}>{getDaysRemaining(nextExam.exam_date)} left</Text>
            </View>
            <Text style={styles.countdownSubject}>{nextExam.subject}</Text>
            {nextExam.notes ? <Text style={styles.countdownNotes} numberOfLines={1}>{nextExam.notes}</Text> : null}
          </LinearGradient>
        )}

        {/* Alarms List */}
        <View style={styles.listContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PRACTICE ALARMS</Text>

          {alarms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Clock size={72} color={isDarkMode ? '#334155' : '#E5E7EB'} strokeWidth={1.5} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No Study Alarms Set</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                Set daily study practice reminders to stay consistent and keep your streak.
              </Text>
              <TouchableOpacity 
                style={styles.createBtn}
                onPress={() => navigation.navigate('AddAlarm')}
              >
                <Text style={styles.createBtnText}>Create Practice Alarm</Text>
              </TouchableOpacity>
            </View>
          ) : (
            alarms.map((alarm) => (
              <TouchableOpacity
                key={alarm.id}
                style={[styles.alarmItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => navigation.navigate('AddAlarm', { alarm })}
                activeOpacity={0.8}
              >
                <View style={styles.alarmInfo}>
                  <View style={styles.timeRow}>
                    <Text style={[styles.alarmTimeText, { color: alarm.is_active ? colors.text : colors.textSecondary }]}>
                      {alarm.time.split(' ')[0]}
                    </Text>
                    <Text style={[styles.alarmPeriodText, { color: alarm.is_active ? colors.text : colors.textSecondary }]}>
                      {alarm.time.split(' ')[1]}
                    </Text>
                  </View>
                  <Text style={[styles.alarmTitleText, { color: alarm.is_active ? colors.text : colors.textSecondary }]} numberOfLines={1}>
                    {alarm.title || 'Study MCQs'}
                  </Text>
                  <Text style={styles.alarmRepeatText}>
                    {alarm.repeat_type === 'custom' 
                      ? alarm.days_of_week?.join(', ') 
                      : alarm.repeat_type.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.actionRow}>
                  <Switch
                    value={alarm.is_active}
                    onValueChange={() => toggleAlarm(user?.id, alarm.id)}
                    trackColor={{ false: "#3A3A3C", true: "#34C759" }}
                    thumbColor="#FFF"
                  />
                  <TouchableOpacity 
                    style={styles.deleteBtn}
                    onPress={() => deleteAlarm(user?.id, alarm.id)}
                  >
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Info Box */}
        <View style={[styles.infoCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFF', borderColor: colors.border }]}>
          <Smartphone size={20} color="#3B82F6" />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Study practice reminders use high-priority system alerts and will trigger even if the app is in the background or locked.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  addBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  
  // Segmented Control Navigation
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: 'rgba(120, 120, 128, 0.08)',
    borderRadius: 12,
    padding: 2,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  segmentActive: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  segmentText: { fontSize: 13, fontWeight: '700' },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  // Countdown Card
  countdownCard: {
    borderRadius: 20,
    padding: 18,
    marginTop: 8,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  countdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countdownTag: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  countdownDays: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countdownSubject: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 10,
  },
  countdownNotes: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },

  // Alarms List
  listContainer: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  alarmItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  alarmInfo: { flex: 1 },
  timeRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 2 },
  alarmTimeText: { fontSize: 32, fontWeight: '300', marginRight: 4 },
  alarmPeriodText: { fontSize: 16, fontWeight: '700' },
  alarmTitleText: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  alarmRepeatText: { fontSize: 11, color: '#3B82F6', fontWeight: '800', letterSpacing: 0.5 },
  
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  deleteBtn: { padding: 4 },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: { fontSize: 18, fontWeight: '900', marginTop: 16 },
  emptySub: { fontSize: 12, textAlign: 'center', paddingHorizontal: 24, marginTop: 6, lineHeight: 18 },
  createBtn: {
    backgroundColor: '#FF9F0A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 20,
  },
  createBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 8,
  },
  infoText: { flex: 1, fontSize: 11, lineHeight: 16, fontWeight: '600' },

  // Active Alarm Modal Styles
  modalGradient: { flex: 1 },
  modalContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  modalHeaderTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  modalBody: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 16,
  },
  bellContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#EF4444',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  bellGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAlarmTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '950',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalAlarmTime: {
    color: '#FBBF24',
    fontSize: 48,
    fontWeight: '300',
    marginBottom: 20,
  },
  modalAlarmBody: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
    paddingHorizontal: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snoozeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  snoozeBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  dismissBtn: {
    backgroundColor: '#34C759',
  },
  dismissBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
});

export default AlarmScreen;

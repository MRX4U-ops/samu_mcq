import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { ArrowLeft, Plus, Calendar, Trash2, BookOpen, Clock, AlertTriangle, Timer, Bell, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import useAlarmStore from '../store/alarmStore';
import useAuthStore from '../store/authStore';
import { LinearGradient } from 'expo-linear-gradient';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const ExamReminderScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuthStore();
  const { exams, fetchExams, saveExam, deleteExam } = useAlarmStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  
  // Custom Date Builder State
  const [day, setDay] = useState(new Date().getDate());
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (user) {
      fetchExams(user.id);
    }
  }, [user]);

  const handleSave = async () => {
    if (!subject.trim()) {
      Alert.alert('Required', 'Please enter the exam subject.');
      return;
    }

    // Build the date object
    const examDate = new Date(year, monthIndex, day, 9, 0, 0); // 9:00 AM on that day
    
    if (examDate.getTime() < Date.now()) {
      Alert.alert('Invalid Date', 'The exam date must be in the future.');
      return;
    }

    const examData = {
      subject: subject.trim(),
      exam_date: examDate.toISOString(),
      notes: notes.trim(),
    };

    const result = await saveExam(user?.id, examData);
    if (result && result.success) {
      setSubject('');
      setNotes('');
      // Reset date to today
      setDay(new Date().getDate());
      setMonthIndex(new Date().getMonth());
      setYear(new Date().getFullYear());
      setShowAddForm(false);
    } else {
      Alert.alert('Error', 'Failed to save exam reminder.');
    }
  };

  const getDaysRemainingText = (dateStr) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Passed';
    if (days === 0) return '⏳ Today';
    if (days === 1) return '⏳ Tomorrow';
    return `⏳ ${days} days left`;
  };

  const formatExamDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Date incrementers/decrementers
  const changeDay = (dir) => {
    setDay(prev => {
      let next = prev + dir;
      const maxDays = new Date(year, monthIndex + 1, 0).getDate();
      if (next > maxDays) next = 1;
      if (next < 1) next = maxDays;
      return next;
    });
  };

  const changeMonth = (dir) => {
    setMonthIndex(prev => {
      let next = prev + dir;
      if (next > 11) next = 0;
      if (next < 0) next = 11;
      return next;
    });
  };

  const changeYear = (dir) => {
    setYear(prev => prev + dir);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Exam Planner</Text>
        <TouchableOpacity 
          onPress={() => setShowAddForm(true)} 
          style={styles.addBtn}
        >
          <Plus size={24} color="#FF9F0A" />
        </TouchableOpacity>
      </View>

      {/* Segmented Control Navigation */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity 
          style={styles.segmentBtn}
          onPress={() => navigation.navigate('TimerSet')}
        >
          <Bell size={16} color={colors.textSecondary} />
          <Text style={[styles.segmentText, { color: colors.textSecondary }]}>Alarms</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.segmentBtn, styles.segmentActive, { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' }]}>
          <Calendar size={16} color="#FF9F0A" />
          <Text style={[styles.segmentText, { color: colors.text }]}>Exams</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.segmentBtn}
          onPress={() => navigation.navigate('StudyTimer')}
        >
          <Timer size={16} color={colors.textSecondary} />
          <Text style={[styles.segmentText, { color: colors.textSecondary }]}>Timer</Text>
        </TouchableOpacity>
      </View>

      {/* Add Exam Modal Form */}
      <Modal
        visible={showAddForm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddForm(false)}
      >
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Upcoming Exam</Text>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              
              <Text style={[styles.label, { color: colors.textSecondary }]}>SUBJECT NAME</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={subject}
                onChangeText={setSubject}
                placeholder="e.g. Pharmacology CBT"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>EXAM DATE</Text>
              
              {/* Custom Selector for Day / Month / Year */}
              <View style={styles.datePickerRow}>
                {/* Day selector */}
                <View style={styles.pickerCol}>
                  <TouchableOpacity onPress={() => changeDay(1)} style={styles.arrowBtn}>
                    <Text style={[styles.arrowText, { color: colors.primary }]}>▲</Text>
                  </TouchableOpacity>
                  <Text style={[styles.pickerVal, { color: colors.text }]}>{day.toString().padStart(2, '0')}</Text>
                  <TouchableOpacity onPress={() => changeDay(-1)} style={styles.arrowBtn}>
                    <Text style={[styles.arrowText, { color: colors.primary }]}>▼</Text>
                  </TouchableOpacity>
                  <Text style={styles.pickerLabel}>DAY</Text>
                </View>

                {/* Month selector */}
                <View style={styles.pickerCol}>
                  <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowBtn}>
                    <Text style={[styles.arrowText, { color: colors.primary }]}>▲</Text>
                  </TouchableOpacity>
                  <Text style={[styles.pickerVal, { color: colors.text }]}>{MONTHS[monthIndex]}</Text>
                  <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowBtn}>
                    <Text style={[styles.arrowText, { color: colors.primary }]}>▼</Text>
                  </TouchableOpacity>
                  <Text style={styles.pickerLabel}>MONTH</Text>
                </View>

                {/* Year selector */}
                <View style={styles.pickerCol}>
                  <TouchableOpacity onPress={() => changeYear(1)} style={styles.arrowBtn}>
                    <Text style={[styles.arrowText, { color: colors.primary }]}>▲</Text>
                  </TouchableOpacity>
                  <Text style={[styles.pickerVal, { color: colors.text }]}>{year}</Text>
                  <TouchableOpacity onPress={() => changeYear(-1)} style={styles.arrowBtn}>
                    <Text style={[styles.arrowText, { color: colors.primary }]}>▼</Text>
                  </TouchableOpacity>
                  <Text style={styles.pickerLabel}>YEAR</Text>
                </View>
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>NOTES (OPTIONAL)</Text>
              <TextInput
                style={[styles.input, styles.multilineInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Include modules, topics or tasks..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setShowAddForm(false)}
                >
                  <Text style={[styles.cancelBtnText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalBtn, styles.saveBtn]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveBtnText}>Save Exam</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Exams List */}
        <View style={styles.listContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>UPCOMING EXAMS & CBTs</Text>

          {exams.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Calendar size={72} color={isDarkMode ? '#334155' : '#E5E7EB'} strokeWidth={1.5} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No Upcoming Exams</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                Add your exam schedule to get automatic notifications 3 days and 1 day before the exam.
              </Text>
              <TouchableOpacity 
                style={styles.createBtn}
                onPress={() => setShowAddForm(true)}
              >
                <Text style={styles.createBtnText}>Add Exam Date</Text>
              </TouchableOpacity>
            </View>
          ) : (
            exams.map((exam) => {
              const daysRemainingText = getDaysRemainingText(exam.exam_date);
              const isTodayOrPassed = daysRemainingText === 'Passed' || daysRemainingText === '⏳ Today';
              
              return (
                <View 
                  key={exam.id}
                  style={[styles.examCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.examCardHeader}>
                    <View style={styles.subjectBox}>
                      <BookOpen size={16} color="#3B82F6" />
                      <Text style={[styles.examSubjectText, { color: colors.text }]} numberOfLines={1}>
                        {exam.subject}
                      </Text>
                    </View>
                    
                    <Text style={[
                      styles.examDaysText, 
                      isTodayOrPassed ? { color: '#EF4444' } : { color: '#FBBF24' }
                    ]}>
                      {daysRemainingText}
                    </Text>
                  </View>

                  {exam.notes ? (
                    <Text style={[styles.examNotesText, { color: colors.textSecondary }]} numberOfLines={2}>
                      {exam.notes}
                    </Text>
                  ) : null}

                  <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

                  <View style={styles.examCardFooter}>
                    <View style={styles.dateBox}>
                      <Calendar size={14} color={colors.textSecondary} />
                      <Text style={[styles.examDateText, { color: colors.textSecondary }]}>
                        {formatExamDate(exam.exam_date)}
                      </Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.deleteBtn}
                      onPress={() => deleteExam(user?.id, exam.id)}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFF', borderColor: colors.border }]}>
          <AlertTriangle size={20} color="#FBBF24" />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Notifications will automatically remind you at 9:00 AM both 3 days before and 1 day before any scheduled exam.
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

  // List of Exams
  listContainer: { marginBottom: 20, marginTop: 8 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  examCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  examCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  examSubjectText: {
    fontSize: 16,
    fontWeight: '800',
  },
  examDaysText: {
    fontSize: 12,
    fontWeight: '900',
  },
  examNotesText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    marginBottom: 10,
  },
  examCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  examDateText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: { fontSize: 18, fontWeight: '900', marginTop: 16 },
  emptySub: { fontSize: 12, textAlign: 'center', paddingHorizontal: 24, marginTop: 6, lineHeight: 18 },
  createBtn: {
    backgroundColor: '#3B82F6',
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

  // Modal styling
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  multilineInput: {
    textAlignVertical: 'top',
    height: 80,
  },
  
  // Custom picker inside modal
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(120, 120, 128, 0.04)',
    marginVertical: 4,
  },
  pickerCol: {
    alignItems: 'center',
    width: 70,
  },
  arrowBtn: {
    padding: 6,
  },
  arrowText: {
    fontSize: 14,
  },
  pickerVal: {
    fontSize: 20,
    fontWeight: '800',
    marginVertical: 4,
  },
  pickerLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94A3B8',
    marginTop: 2,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 8,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: 'rgba(120, 120, 128, 0.1)',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  saveBtn: {
    backgroundColor: '#3B82F6',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default ExamReminderScreen;

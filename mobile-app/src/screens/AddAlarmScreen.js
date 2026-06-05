import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Switch, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ArrowLeft, Check, Clock, Volume2, Smartphone, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import useAlarmStore from '../store/alarmStore';
import useAuthStore from '../store/authStore';

const AddAlarmScreen = ({ navigation, route }) => {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuthStore();
  const { saveAlarm } = useAlarmStore();
  
  const editingAlarm = route.params?.alarm;

  // Form State
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState('AM');
  const [title, setTitle] = useState('Study Session');
  const [repeatType, setRepeatType] = useState('daily'); // 'daily', 'weekly', 'custom'
  const [selectedDays, setSelectedDays] = useState({
    Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false
  });
  const [ringtoneEnabled, setRingtoneEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  useEffect(() => {
    if (editingAlarm) {
      // Parse time e.g. "08:30 PM"
      const [timeStr, ampm] = editingAlarm.time.split(' ');
      const [h, m] = timeStr.split(':').map(Number);
      setHour(h);
      setMinute(m);
      setPeriod(ampm || 'AM');
      setTitle(editingAlarm.title || 'Study Session');
      setRepeatType(editingAlarm.repeat_type || 'daily');
      setRingtoneEnabled(editingAlarm.ringtone_enabled !== false);
      setVibrationEnabled(editingAlarm.vibration_enabled !== false);
      
      if (editingAlarm.days_of_week && Array.isArray(editingAlarm.days_of_week)) {
        const daysMap = { Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false };
        editingAlarm.days_of_week.forEach(day => {
          if (daysMap[day] !== undefined) daysMap[day] = true;
        });
        setSelectedDays(daysMap);
      }
    }
  }, [editingAlarm]);

  const daysOfWeekList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day) => {
    setSelectedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter an alarm label.');
      return;
    }

    const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
    const activeDays = daysOfWeekList.filter(d => selectedDays[d]);

    if (repeatType === 'custom' && activeDays.length === 0) {
      Alert.alert('Required', 'Please select at least one day for custom repeat.');
      return;
    }

    const alarmData = {
      ...(editingAlarm ? { id: editingAlarm.id } : {}),
      title: title.trim(),
      time: formattedTime,
      repeat_type: repeatType,
      days_of_week: repeatType === 'custom' ? activeDays : [],
      ringtone_enabled: ringtoneEnabled,
      vibration_enabled: vibrationEnabled,
      is_active: true,
    };

    const result = await saveAlarm(user?.id, alarmData);
    if (result && result.success) {
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to save alarm. Please try again.');
    }
  };

  // Helper selectors for Hour / Minute
  const incrementHour = () => setHour(prev => (prev === 12 ? 1 : prev + 1));
  const decrementHour = () => setHour(prev => (prev === 1 ? 12 : prev - 1));
  const incrementMinute = () => setMinute(prev => (prev >= 55 ? 0 : prev + 5));
  const decrementMinute = () => setMinute(prev => (prev <= 0 ? 55 : prev - 5));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {editingAlarm ? 'Edit Alarm' : 'New Alarm'}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Check size={24} color="#34C759" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Time Picker Visual Container */}
          <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.pickerColumn}>
              <TouchableOpacity onPress={incrementHour} style={styles.arrowBtn}>
                <Text style={[styles.arrowText, { color: colors.primary }]}>▲</Text>
              </TouchableOpacity>
              <Text style={[styles.timeNumber, { color: colors.text }]}>
                {hour.toString().padStart(2, '0')}
              </Text>
              <TouchableOpacity onPress={decrementHour} style={styles.arrowBtn}>
                <Text style={[styles.arrowText, { color: colors.primary }]}>▼</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.colon, { color: colors.text }]}>:</Text>

            <View style={styles.pickerColumn}>
              <TouchableOpacity onPress={incrementMinute} style={styles.arrowBtn}>
                <Text style={[styles.arrowText, { color: colors.primary }]}>▲</Text>
              </TouchableOpacity>
              <Text style={[styles.timeNumber, { color: colors.text }]}>
                {minute.toString().padStart(2, '0')}
              </Text>
              <TouchableOpacity onPress={decrementMinute} style={styles.arrowBtn}>
                <Text style={[styles.arrowText, { color: colors.primary }]}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.ampmSelector}>
              <TouchableOpacity 
                style={[styles.ampmBtn, period === 'AM' && { backgroundColor: '#FF9F0A' }]}
                onPress={() => setPeriod('AM')}
              >
                <Text style={[styles.ampmText, period === 'AM' ? styles.ampmActiveText : { color: colors.textSecondary }]}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.ampmBtn, period === 'PM' && { backgroundColor: '#FF9F0A' }]}
                onPress={() => setPeriod('PM')}
              >
                <Text style={[styles.ampmText, period === 'PM' ? styles.ampmActiveText : { color: colors.textSecondary }]}>PM</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Alarm Label Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ALARM LABEL</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Microbiology Study Session"
              placeholderTextColor={colors.textSecondary}
              maxLength={40}
            />
          </View>

          {/* Repeat Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>REPEAT OPTIONS</Text>
            
            <View style={[styles.repeatGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity 
                style={[styles.repeatBtn, repeatType === 'daily' && styles.repeatBtnActive]}
                onPress={() => setRepeatType('daily')}
              >
                <Text style={[styles.repeatBtnText, repeatType === 'daily' ? styles.repeatBtnTextActive : { color: colors.text }]}>Daily</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.repeatBtn, repeatType === 'weekly' && styles.repeatBtnActive]}
                onPress={() => setRepeatType('weekly')}
              >
                <Text style={[styles.repeatBtnText, repeatType === 'weekly' ? styles.repeatBtnTextActive : { color: colors.text }]}>Weekly</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.repeatBtn, repeatType === 'custom' && styles.repeatBtnActive]}
                onPress={() => setRepeatType('custom')}
              >
                <Text style={[styles.repeatBtnText, repeatType === 'custom' ? styles.repeatBtnTextActive : { color: colors.text }]}>Custom</Text>
              </TouchableOpacity>
            </View>

            {/* Custom Days Picker */}
            {repeatType === 'custom' && (
              <View style={[styles.customDaysContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {daysOfWeekList.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayCircle,
                      selectedDays[day] ? { backgroundColor: '#FF9F0A' } : { backgroundColor: isDarkMode ? '#334155' : '#E5E7EB' }
                    ]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={[styles.dayCircleText, selectedDays[day] ? styles.ampmActiveText : { color: colors.text }]}>
                      {day.substring(0, 1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Sound / Alarm Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ALARM ALERT SETTINGS</Text>
            
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Ringtone Toggle */}
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Volume2 size={20} color="#FF9F0A" />
                  <View style={styles.settingTextCol}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Play Ringtone</Text>
                    <Text style={[styles.settingSub, { color: colors.textSecondary }]}>Looping alarm alert sound</Text>
                  </View>
                </View>
                <Switch
                  value={ringtoneEnabled}
                  onValueChange={setRingtoneEnabled}
                  trackColor={{ false: "#3A3A3C", true: "#34C759" }}
                  thumbColor="#FFF"
                />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Vibration Toggle */}
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Smartphone size={20} color="#3B82F6" />
                  <View style={styles.settingTextCol}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Vibrate Alert</Text>
                    <Text style={[styles.settingSub, { color: colors.textSecondary }]}>Vibrate device on alert trigger</Text>
                  </View>
                </View>
                <Switch
                  value={vibrationEnabled}
                  onValueChange={setVibrationEnabled}
                  trackColor={{ false: "#3A3A3C", true: "#34C759" }}
                  thumbColor="#FFF"
                />
              </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
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
  saveBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 },

  // Picker
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  pickerColumn: {
    alignItems: 'center',
    width: 70,
  },
  arrowBtn: {
    padding: 8,
  },
  arrowText: {
    fontSize: 16,
  },
  timeNumber: {
    fontSize: 48,
    fontWeight: '300',
  },
  colon: {
    fontSize: 40,
    fontWeight: '300',
    paddingBottom: 4,
  },
  ampmSelector: {
    marginLeft: 20,
    gap: 8,
  },
  ampmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(120, 120, 128, 0.08)',
  },
  ampmText: {
    fontSize: 13,
    fontWeight: '800',
  },
  ampmActiveText: {
    color: '#FFF',
    fontWeight: '900',
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  input: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 15,
    fontWeight: '600',
  },

  // Repeat Choices
  repeatGroup: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 3,
  },
  repeatBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 13,
  },
  repeatBtnActive: {
    backgroundColor: '#FF9F0A',
  },
  repeatBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  repeatBtnTextActive: {
    color: '#FFF',
    fontWeight: '900',
  },

  // Custom Days
  customDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleText: {
    fontSize: 13,
    fontWeight: '800',
  },

  // Settings Card
  settingsCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTextCol: {
    gap: 2,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  settingSub: {
    fontSize: 11,
  },
  divider: {
    height: 1,
  },
});

export default AddAlarmScreen;

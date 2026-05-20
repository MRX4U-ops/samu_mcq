import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, Alert, Animated } from 'react-native';
import { ArrowLeft, Bell, Calendar, Repeat, Trash2, Plus, Clock, CircleCheck, Volume2, Smartphone } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TimerSetScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [alarms, setAlarms] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  
  // Form State for New Alarm
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState('AM');
  const [label, setLabel] = useState('Study Session');
  const [selectedDays, setSelectedDays] = useState([true, true, true, true, true, false, false]); // Mon-Sun
  
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  useEffect(() => {
    loadAlarms();
  }, []);

  const loadAlarms = async () => {
    try {
      const saved = await AsyncStorage.getItem('study_alarms');
      if (saved) setAlarms(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  };

  const saveAlarms = async (newAlarms) => {
    try {
      await AsyncStorage.setItem('study_alarms', JSON.stringify(newAlarms));
      setAlarms(newAlarms);
    } catch (e) {
      Alert.alert("Error", "Could not save alarm.");
    }
  };

  const addAlarm = () => {
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
    const activeDays = selectedDays.map((d, i) => d ? days[i] : null).filter(Boolean).join(', ');
    
    const newAlarm = {
      id: Date.now().toString(),
      time: timeStr,
      label: label,
      frequency: activeDays || 'Once',
      active: true,
      vibrate: true,
      sound: 'Medical Tone'
    };
    
    const updated = [...alarms, newAlarm].sort((a, b) => a.time.localeCompare(b.time));
    saveAlarms(updated);
    setShowAdd(false);
  };

  const toggleDay = (index) => {
    const updated = [...selectedDays];
    updated[index] = !updated[index];
    setSelectedDays(updated);
  };

  const deleteAlarm = (id) => {
    const updated = alarms.filter(a => a.id !== id);
    saveAlarms(updated);
  };

  const toggleAlarm = (id) => {
    const updated = alarms.map(a => a.id === id ? { ...a, active: !a.active } : a);
    saveAlarms(updated);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#F8F9FA' }]}>
      <View style={[styles.header, { borderBottomColor: isDarkMode ? '#111' : '#EEE' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={28} color={isDarkMode ? '#FFF' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>Alarms</Text>
        <TouchableOpacity onPress={() => setShowAdd(!showAdd)}>
          <Plus size={28} color="#FF9F0A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {showAdd && (
          <View style={[styles.modalOverlay, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF' }]}>
            <View style={styles.modalHeader}>
               <TouchableOpacity onPress={() => setShowAdd(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
               </TouchableOpacity>
               <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>Add Alarm</Text>
               <TouchableOpacity onPress={addAlarm}>
                  <Text style={styles.saveText}>Save</Text>
               </TouchableOpacity>
            </View>

            <View style={styles.timePickerContainer}>
               <View style={styles.pickerColumn}>
                  <TouchableOpacity onPress={() => setHour(prev => (prev % 12) + 1)}>
                    <Text style={[styles.pickerTimeText, { color: isDarkMode ? '#FFF' : '#000' }]}>{hour}</Text>
                  </TouchableOpacity>
               </View>
               <Text style={[styles.pickerColon, { color: isDarkMode ? '#FFF' : '#000' }]}>:</Text>
               <View style={styles.pickerColumn}>
                  <TouchableOpacity onPress={() => setMinute(prev => (prev + 5) % 60)}>
                    <Text style={[styles.pickerTimeText, { color: isDarkMode ? '#FFF' : '#000' }]}>{minute.toString().padStart(2, '0')}</Text>
                  </TouchableOpacity>
               </View>
               <View style={styles.periodPicker}>
                  <TouchableOpacity onPress={() => setPeriod('AM')} style={[styles.periodBtn, period === 'AM' && styles.periodBtnActive]}>
                    <Text style={[styles.periodText, period === 'AM' && styles.periodTextActive]}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setPeriod('PM')} style={[styles.periodBtn, period === 'PM' && styles.periodBtnActive]}>
                    <Text style={[styles.periodText, period === 'PM' && styles.periodTextActive]}>PM</Text>
                  </TouchableOpacity>
               </View>
            </View>

            <View style={[styles.daysContainer, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7' }]}>
               {days.map((day, i) => (
                 <TouchableOpacity 
                   key={i} 
                   style={[styles.dayBtn, selectedDays[i] && styles.dayBtnActive]} 
                   onPress={() => toggleDay(i)}
                 >
                   <Text style={[styles.dayText, selectedDays[i] && styles.dayTextActive]}>{day}</Text>
                 </TouchableOpacity>
               ))}
            </View>

            <View style={[styles.optionRow, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7' }]}>
               <Text style={[styles.optionLabel, { color: isDarkMode ? '#FFF' : '#000' }]}>Label</Text>
               <Text style={styles.optionVal}>{label}</Text>
            </View>

            <View style={[styles.optionRow, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7' }]}>
               <Text style={[styles.optionLabel, { color: isDarkMode ? '#FFF' : '#000' }]}>Sound</Text>
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Volume2 size={16} color="#8E8E93" />
                  <Text style={styles.optionVal}>Medical Tone</Text>
               </View>
            </View>
          </View>
        )}

        <View style={styles.alarmList}>
          {alarms.length === 0 ? (
            <View style={styles.emptyContainer}>
               <Clock size={80} color={isDarkMode ? '#2C2C2E' : '#E5E5EA'} strokeWidth={1} />
               <Text style={[styles.emptyText, { color: isDarkMode ? '#8E8E93' : '#AEAEB2' }]}>No Alarms</Text>
            </View>
          ) : (
            alarms.map((alarm) => (
              <View key={alarm.id} style={[styles.alarmItem, { borderBottomColor: isDarkMode ? '#1C1C1E' : '#EEE' }]}>
                <View style={styles.alarmInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={[styles.alarmTime, { color: isDarkMode ? '#FFF' : '#000' }, !alarm.active && { color: '#8E8E93' }]}>
                      {alarm.time.split(' ')[0]}
                    </Text>
                    <Text style={[styles.alarmPeriod, { color: isDarkMode ? '#FFF' : '#000' }, !alarm.active && { color: '#8E8E93' }]}>
                      {alarm.time.split(' ')[1]}
                    </Text>
                  </View>
                  <Text style={[styles.alarmSubtitle, !alarm.active && { color: '#48484A' }]}>
                    {alarm.label}, {alarm.frequency}
                  </Text>
                </View>
                <View style={styles.alarmActions}>
                   <Switch 
                     value={alarm.active} 
                     onValueChange={() => toggleAlarm(alarm.id)}
                     trackColor={{ false: "#3A3A3C", true: "#34C759" }}
                     thumbColor="#FFF"
                   />
                   <TouchableOpacity onPress={() => deleteAlarm(alarm.id)} style={styles.deleteBtn}>
                      <Trash2 size={20} color="#FF453A" />
                   </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.footerNote}>
           <Smartphone size={14} color="#8E8E93" />
           <Text style={styles.footerText}>Alarms will sound even if the app is in background</Text>
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
    paddingHorizontal: 20, 
    paddingVertical: 15,
    borderBottomWidth: 0.5
  },
  headerTitle: { fontSize: 34, fontWeight: 'bold' },
  scrollContent: { paddingBottom: 100 },
  modalOverlay: {
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    marginBottom: 20
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  cancelText: { color: '#FF9F0A', fontSize: 17 },
  saveText: { color: '#FF9F0A', fontSize: 17, fontWeight: 'bold' },
  modalTitle: { fontSize: 17, fontWeight: '600' },
  timePickerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 150 },
  pickerTimeText: { fontSize: 72, fontWeight: '300' },
  pickerColon: { fontSize: 60, fontWeight: '200', marginHorizontal: 10, paddingBottom: 10 },
  periodPicker: { marginLeft: 20, gap: 10 },
  periodBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#3A3A3C' },
  periodBtnActive: { backgroundColor: '#FF9F0A' },
  periodText: { color: '#8E8E93', fontSize: 13, fontWeight: 'bold' },
  periodTextActive: { color: '#FFF' },
  daysContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 15, borderRadius: 12, marginBottom: 15 },
  dayBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  dayBtnActive: { backgroundColor: '#FF9F0A' },
  dayText: { color: '#8E8E93', fontSize: 14, fontWeight: '500' },
  dayTextActive: { color: '#FFF', fontWeight: 'bold' },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 10 },
  optionLabel: { fontSize: 17, fontWeight: '500' },
  optionVal: { color: '#8E8E93', fontSize: 17 },
  alarmList: { paddingHorizontal: 20 },
  alarmItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 0.5 },
  alarmTime: { fontSize: 50, fontWeight: '200' },
  alarmPeriod: { fontSize: 24, fontWeight: '300', marginLeft: 5, paddingBottom: 8 },
  alarmSubtitle: { fontSize: 13, color: '#8E8E93', marginTop: -5 },
  alarmActions: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  deleteBtn: { padding: 5 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: 28, fontWeight: 'bold', marginTop: 10 },
  footerNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 8 },
  footerText: { fontSize: 12, color: '#8E8E93' }
});

export default TimerSetScreen;

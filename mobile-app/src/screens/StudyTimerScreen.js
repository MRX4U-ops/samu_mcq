import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Animated, Easing, Alert, TextInput } from 'react-native';
import { ArrowLeft, Play, Pause, RotateCcw, Timer, Bell, Calendar, Sparkles, Check, Coffee } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import useAlarmStore from '../store/alarmStore';
import { LinearGradient } from 'expo-linear-gradient';

const StudyTimerScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const { 
    timerSeconds, 
    timerDuration, 
    isTimerRunning, 
    timerMode, 
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    resetTimer,
    setTimerSeconds
  } = useAlarmStore();

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customMins, setCustomMins] = useState('50');

  // Pulsating animation for active timer
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Rotation animation for circular status
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTimerRunning) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.98,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Slow rotating animation for visual accent
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 12000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
    }
  }, [isTimerRunning]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (timerDuration === 0) return 0;
    return (timerDuration - timerSeconds) / timerDuration;
  };

  const getModeLabel = () => {
    switch (timerMode) {
      case 'pomodoro': return '🔴 Focus Session';
      case 'short_break': return '☕ Short Break';
      case 'long_break': return '🌴 Long Break';
      case 'custom': return '⚡ Custom Session';
      default: return 'Study Session';
    }
  };

  const handleStartPreset = (durationSecs, mode) => {
    setShowCustomInput(false);
    startTimer(durationSecs, mode);
  };

  const handleStartCustom = () => {
    const mins = parseInt(customMins, 10);
    if (isNaN(mins) || mins <= 0 || mins > 180) {
      Alert.alert('Invalid Duration', 'Please enter a value between 1 and 180 minutes.');
      return;
    }
    setShowCustomInput(false);
    startTimer(mins * 60, 'custom');
  };

  // Convert rotate value to degrees
  const spinDegrees = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Study Timer</Text>
        <View style={{ width: 24 }} />
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
        
        <TouchableOpacity 
          style={styles.segmentBtn}
          onPress={() => navigation.navigate('ExamReminder')}
        >
          <Calendar size={16} color={colors.textSecondary} />
          <Text style={[styles.segmentText, { color: colors.textSecondary }]}>Exams</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.segmentBtn, styles.segmentActive, { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' }]}>
          <Timer size={16} color="#FF9F0A" />
          <Text style={[styles.segmentText, { color: colors.text }]}>Timer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Timer Visualization Ring */}
        <View style={styles.timerCircleContainer}>
          <Animated.View style={[
            styles.timerOuterRing, 
            { 
              borderColor: isTimerRunning ? '#FF9F0A' : colors.border,
              transform: [{ scale: pulseAnim }],
              backgroundColor: colors.card
            }
          ]}>
            {/* Spinning decorative orbit */}
            {isTimerRunning && (
              <Animated.View style={[styles.orbitWrapper, { transform: [{ rotate: spinDegrees }] }]}>
                <View style={styles.orbitDot} />
              </Animated.View>
            )}

            <View style={styles.timerInnerContent}>
              <Text style={[styles.modeLabel, { color: colors.textSecondary }]}>
                {getModeLabel()}
              </Text>
              <Text style={[styles.timerCountdown, { color: colors.text }]}>
                {formatTime(timerSeconds)}
              </Text>
              
              {/* Mini linear progress inside */}
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${getProgress() * 100}%` }]} />
              </View>
              <Text style={styles.progressPercentText}>
                {Math.round(getProgress() * 100)}% Complete
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Play / Pause / Reset Control Buttons */}
        <View style={styles.controlsRow}>
          <TouchableOpacity 
            style={[styles.controlBtn, styles.resetBtn, { borderColor: colors.border }]}
            onPress={resetTimer}
          >
            <RotateCcw size={22} color={colors.text} />
          </TouchableOpacity>

          {isTimerRunning ? (
            <TouchableOpacity 
              style={[styles.controlBtn, styles.playBtn, { backgroundColor: '#FF453A' }]}
              onPress={pauseTimer}
            >
              <Pause size={28} color="#FFF" fill="#FFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.controlBtn, styles.playBtn, { backgroundColor: '#34C759' }]}
              onPress={timerSeconds === 0 ? resetTimer : resumeTimer}
            >
              <Play size={28} color="#FFF" fill="#FFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.controlBtn, styles.customTriggerBtn, { borderColor: colors.border }]}
            onPress={() => setShowCustomInput(!showCustomInput)}
          >
            <Sparkles size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Custom duration configuration inline */}
        {showCustomInput && (
          <View style={[styles.customForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Set Custom Timer</Text>
            <View style={styles.formRow}>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                keyboardType="numeric"
                value={customMins}
                onChangeText={setCustomMins}
                maxLength={3}
                placeholder="Mins"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={[styles.formText, { color: colors.text }]}>Minutes</Text>
              <TouchableOpacity 
                style={styles.formSubmitBtn}
                onPress={handleStartCustom}
              >
                <Check size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Presets Grid */}
        <View style={styles.presetsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>QUICK PRESETS</Text>
          
          <View style={styles.presetsGrid}>
            <TouchableOpacity 
              style={[styles.presetCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleStartPreset(1500, 'pomodoro')}
            >
              <View style={[styles.presetIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Timer size={20} color="#EF4444" />
              </View>
              <Text style={[styles.presetTitle, { color: colors.text }]}>Pomodoro</Text>
              <Text style={styles.presetMins}>25 mins</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.presetCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleStartPreset(2700, 'pomodoro')}
            >
              <View style={[styles.presetIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Sparkles size={20} color="#3B82F6" />
              </View>
              <Text style={[styles.presetTitle, { color: colors.text }]}>Med Study</Text>
              <Text style={styles.presetMins}>45 mins</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.presetCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleStartPreset(300, 'short_break')}
            >
              <View style={[styles.presetIconBox, { backgroundColor: 'rgba(52, 199, 89, 0.15)' }]}>
                <Coffee size={20} color="#34C759" />
              </View>
              <Text style={[styles.presetTitle, { color: colors.text }]}>Short Break</Text>
              <Text style={styles.presetMins}>5 mins</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.presetCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleStartPreset(900, 'long_break')}
            >
              <View style={[styles.presetIconBox, { backgroundColor: 'rgba(251, 191, 36, 0.15)' }]}>
                <Coffee size={20} color="#FBBF24" />
              </View>
              <Text style={[styles.presetTitle, { color: colors.text }]}>Long Break</Text>
              <Text style={styles.presetMins}>15 mins</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tip Box */}
        <View style={[styles.tipCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFF', borderColor: colors.border }]}>
          <Text style={[styles.tipTitle, { color: colors.primary }]}>💡 Pomodoro Technique</Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            Study with intense focus for 25 minutes (one Pomodoro), then take a 5-minute break. After 4 sessions, take a longer 15-30 minute break. This keeps the brain fresh for medical active recall!
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

  // Timer Circle
  timerCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  timerOuterRing: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 8,
    shadowColor: '#FF9F0A',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
  },
  orbitWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  orbitDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FF9F0A',
    marginTop: -10,
    shadowColor: '#FF9F0A',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  timerInnerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  timerCountdown: {
    fontSize: 54,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  progressTrack: {
    width: 140,
    height: 4,
    backgroundColor: 'rgba(120, 120, 128, 0.15)',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF9F0A',
  },
  progressPercentText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 8,
  },

  // Controls
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    marginBottom: 24,
  },
  controlBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  resetBtn: {
    backgroundColor: 'rgba(120, 120, 128, 0.05)',
  },
  customTriggerBtn: {
    backgroundColor: 'rgba(120, 120, 128, 0.05)',
  },

  // Custom Form
  customForm: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
  },
  formTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  formInput: {
    width: 70,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  formText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  formSubmitBtn: {
    backgroundColor: '#FF9F0A',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Presets
  presetsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  presetCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 5,
  },
  presetIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  presetTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  presetMins: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '700',
  },

  // Tip
  tipCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
});

export default StudyTimerScreen;

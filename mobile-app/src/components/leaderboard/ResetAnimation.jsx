import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Animated, Dimensions, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trophy, Swords, Zap } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const ResetAnimation = () => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.5))[0];

  useEffect(() => {
    checkReset();
  }, []);

  const checkReset = async () => {
    const lastSeenWeek = await AsyncStorage.getItem('last_seen_week');
    const currentWeek = new Date().getFullYear() + '-' + getWeekNumber(new Date());

    if (lastSeenWeek && lastSeenWeek !== currentWeek) {
      showAnimation();
    }
    await AsyncStorage.setItem('last_seen_week', currentWeek);
  };

  const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
  };

  const showAnimation = () => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true })
    ]).start();
  };

  const hideAnimation = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => {
      setVisible(false);
    });
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[
          styles.content, 
          { backgroundColor: colors.surface, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}>
          <View style={styles.iconContainer}>
             <Swords size={60} color={colors.primary} />
             <Animated.View style={styles.zapIcon}>
                <Zap size={30} color="#F59E0B" fill="#F59E0B" />
             </Animated.View>
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>New Week. New Battle!</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            The leaderboard has been reset. Will you dominate the arena this week?
          </Text>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={hideAnimation}
          >
            <Text style={styles.buttonText}>START BATTLE</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  content: { width: width * 0.85, padding: 40, borderRadius: 35, alignItems: 'center', gap: 20 },
  iconContainer: { marginBottom: 10 },
  zapIcon: { position: 'absolute', top: -10, right: -10 },
  title: { fontSize: 24, fontWeight: '900', textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  button: { width: '100%', paddingVertical: 18, borderRadius: 20, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});

export default ResetAnimation;

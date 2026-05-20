import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Search, Bell, User, CreditCard } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import NotificationBell from './NotificationBell';

const TopHeader = ({ title, showIcons = true }) => {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title || 'SAMU MCQs'}</Text>
      
      {showIcons && (
        <View style={styles.iconContainer}>
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => navigation.navigate('Search')}
          >
            <Search size={22} color={colors.text} />
          </TouchableOpacity>
          
          <NotificationBell navigation={navigation} />
          
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => navigation.navigate('Subscription')}
          >
            <CreditCard size={22} color="#F59E0B" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => navigation.navigate('Profile')}
          >
            <User size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20, // Move downward
    borderBottomWidth: 1,
    elevation: 2,
    shadowOpacity: 0.05,
    zIndex: 100,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginLeft: 15,
    padding: 8,
    borderRadius: 12,
  },
  bellWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFF',
  }
});

export default TopHeader;

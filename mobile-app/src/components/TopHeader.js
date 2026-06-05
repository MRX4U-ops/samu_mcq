import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { Search, Bell, User, CreditCard } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import NotificationBell from './NotificationBell';
import useAuthStore from '../store/authStore';
import { AVATAR_DATA } from '../assets/AvatarData';

const PREDEFINED_AVATARS = [
  { id: 'dr1',  src: { uri: AVATAR_DATA.dr1 } },
  { id: 'dr2',  src: { uri: AVATAR_DATA.dr2 } },
  { id: 'dr3',  src: { uri: AVATAR_DATA.dr3 } },
  { id: 'dr4',  src: { uri: AVATAR_DATA.dr4 } },
  { id: 'dr5',  src: { uri: AVATAR_DATA.dr5 } },
  { id: 'dr6',  src: { uri: AVATAR_DATA.dr6 } },
  { id: 'dr7',  src: { uri: AVATAR_DATA.dr7 } },
  { id: 'dr8',  src: { uri: AVATAR_DATA.dr8 } },
  { id: 'dr9',  src: { uri: AVATAR_DATA.dr9 } },
  { id: 'dr10', src: { uri: AVATAR_DATA.dr10 } },
];

const getAvatarSrc = (avatarId) => {
  const found = PREDEFINED_AVATARS.find(a => a.id === avatarId);
  return found ? found.src : null;
};

const TopHeader = ({ title, showIcons = true }) => {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const { profile } = useAuthStore();

  const avatarSrc = profile?.avatar_url
    ? (getAvatarSrc(profile.avatar_url) || (profile.avatar_url.startsWith('http') ? { uri: profile.avatar_url } : null))
    : null;

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
            {avatarSrc ? (
              <Image source={avatarSrc} style={styles.avatarImage} />
            ) : (
              <User size={22} color={colors.text} />
            )}
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
  avatarImage: {
    width: 24,
    height: 24,
    borderRadius: 8,
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

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { User, Camera, ShieldCheck, Check, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import useAuthStore from '../../store/authStore';

import { AVATAR_DATA } from '../../assets/AvatarData';

const PREDEFINED_AVATARS = [
  { id: 'dr1',  label: 'Dr. Alex',    src: { uri: AVATAR_DATA.dr1 } },
  { id: 'dr2',  label: 'Dr. Sara',    src: { uri: AVATAR_DATA.dr2 } },
  { id: 'dr3',  label: 'Dr. James',   src: { uri: AVATAR_DATA.dr3 } },
  { id: 'dr4',  label: 'Dr. Amara',   src: { uri: AVATAR_DATA.dr4 } },
  { id: 'dr5',  label: 'Dr. Karim',   src: { uri: AVATAR_DATA.dr5 } },
  { id: 'dr6',  label: 'Dr. Rose',    src: { uri: AVATAR_DATA.dr6 } },
  { id: 'dr7',  label: 'Dr. Singh',   src: { uri: AVATAR_DATA.dr7 } },
  { id: 'dr8',  label: 'Dr. Mei',     src: { uri: AVATAR_DATA.dr8 } },
  { id: 'dr9',  label: 'Student',     src: { uri: AVATAR_DATA.dr9 } },
  { id: 'dr10', label: 'Dr. Nurse',   src: { uri: AVATAR_DATA.dr10 } },
];

const ProfileHeader = ({ user, colors }) => {
  const { updateProfile, isActionLoading, fetchProfile } = useAuthStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [newName, setNewName] = useState(user.name);

  // Sync internal state when the user prop changes
  React.useEffect(() => {
    if (user.name) setNewName(user.name);
  }, [user.name]);

  const getAvatarSrc = (avatarId) => {
    const found = PREDEFINED_AVATARS.find(a => a.id === avatarId);
    return found ? found.src : null;
  };

  const handleSelectAvatar = async (avatar) => {
    const { error } = await updateProfile({ avatar_url: avatar.id });
    if (error) {
      Alert.alert('Error', 'Failed to update avatar: ' + (error.message || error));
    } else {
      setShowAvatarPicker(false);
      await fetchProfile(user.id || user.uid);
    }
  };

  const handleSaveName = async () => {
    if (newName.trim().length < 2) {
      Alert.alert('Error', 'Name is too short');
      return;
    }
    const { error } = await updateProfile({ name: newName });
    if (error) {
      Alert.alert('Error', 'Failed to update name: ' + (error.message || error));
    } else {
      // Force an explicit fetch to be absolutely sure the UI updates
      await fetchProfile(user.id || user.uid);
      setIsEditingName(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#6366F1' }]}>
      <View style={styles.headerTop}>
        <View style={styles.avatarWrapper}>
          <TouchableOpacity 
            style={styles.avatarBox} 
            onPress={() => setShowAvatarPicker(!showAvatarPicker)}
          >
            {isActionLoading ? (
              <ActivityIndicator color="#6366F1" />
            ) : getAvatarSrc(user.avatar_url) ? (
              <Image source={getAvatarSrc(user.avatar_url)} style={styles.avatarImage} />
            ) : user.avatar_url && user.avatar_url.startsWith('http') ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
            ) : (
              <User size={40} color="#6366F1" />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.editBtn} 
            onPress={() => setShowAvatarPicker(!showAvatarPicker)} 
            disabled={isActionLoading}
          >
            <Camera size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.badge}>
          <ShieldCheck size={14} color="#FFF" />
          <Text style={styles.badgeText}>{user.role?.toUpperCase() || 'VERIFIED USER'}</Text>
        </View>
      </View>

      {showAvatarPicker && (
          <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Choose Your Doctor Avatar</Text>
            <TouchableOpacity onPress={() => setShowAvatarPicker(false)}>
              <X size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.avatarList}>
            {PREDEFINED_AVATARS.map((avatar) => {
              const isSelected = user.avatar_url === avatar.id;
              return (
                <TouchableOpacity 
                  key={avatar.id} 
                  onPress={() => handleSelectAvatar(avatar)}
                  style={[styles.avatarPickItem, isSelected && styles.avatarPickItemSelected]}
                >
                  <Image 
                    source={avatar.src} 
                    style={styles.avatarPickImage} 
                  />
                  <Text style={styles.avatarLabel}>{avatar.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.userInfo}>
        {isEditingName ? (
          <View style={styles.nameEditBox}>
            <TextInput
              style={styles.nameInput}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              placeholder="Enter your name"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
            <TouchableOpacity onPress={handleSaveName} style={styles.iconBtn}>
              <Check size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsEditingName(false)} style={styles.iconBtn}>
              <X size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => { setIsEditingName(true); setNewName(user.name); }} style={styles.nameRow}>
            <Text style={styles.name}>{user.name || 'Student Name'}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.email}>{user.email || 'email@example.com'}</Text>
        {user.phone && <Text style={styles.phone}>{user.phone}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    borderRadius: 32,
    padding: 25,
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  editBtn: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#10B981',
    padding: 6,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    marginLeft: 6,
    letterSpacing: 1,
  },
  userInfo: {
    marginTop: 10,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
    marginBottom: 5,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  avatarList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  avatarPickItem: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    alignItems: 'center',
    width: 80,
  },
  avatarPickItemSelected: {
    borderWidth: 3,
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  avatarPickImage: {
    width: 68,
    height: 68,
    borderRadius: 16,
  },
  avatarLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4B5563',
    marginTop: 4,
    textAlign: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameEditBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  nameInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    height: 40,
  },
  iconBtn: {
    padding: 8,
    marginLeft: 5,
  },
  name: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  phone: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
  },
});

export default ProfileHeader;

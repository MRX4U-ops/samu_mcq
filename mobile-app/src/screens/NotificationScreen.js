import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { ArrowLeft, Bell, Info, Zap, Award, CircleCheck } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const NotificationScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New MCQs Added!',
      message: 'Medical Chemistry Module 2 now has 12 fresh topics with 200+ questions.',
      type: 'update',
      time: '2 hours ago',
      unread: true,
      icon: Zap,
      color: '#6366F1'
    },
    {
      id: '2',
      title: 'Practice Reminder',
      message: 'You haven\'t completed your daily situational task. Keep your streak alive!',
      type: 'alert',
      time: '5 hours ago',
      unread: true,
      icon: Bell,
      color: '#F59E0B'
    },
    {
      id: '3',
      title: 'Battle Invite',
      message: 'User_492 has challenged you to a quick anatomy battle.',
      type: 'invite',
      time: 'Yesterday',
      unread: false,
      icon: Award,
      color: '#EC4899'
    },
    {
      id: '4',
      title: 'System Update',
      message: 'App version 2.4.0 is now live with improved offline MCQ support.',
      type: 'info',
      time: '2 days ago',
      unread: false,
      icon: Info,
      color: '#10B981'
    }
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const renderItem = ({ item }) => {
    const Icon = item.icon;
    return (
      <TouchableOpacity 
        style={[
          styles.notiItem, 
          { backgroundColor: colors.surface },
          item.unread && { borderLeftWidth: 4, borderLeftColor: item.color }
        ]}
      >
        <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
          <Icon size={22} color={item.color} />
        </View>
        <View style={styles.notiInfo}>
          <View style={styles.notiHeader}>
            <Text style={[styles.notiTitle, { color: colors.text }]}>{item.title}</Text>
            {item.unread && <View style={[styles.unreadDot, { backgroundColor: item.color }]} />}
          </View>
          <Text style={[styles.notiMsg, { color: colors.textSecondary }]} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.notiTime}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Updates & Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <CircleCheck size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Bell size={60} color="#E2E8F0" />
            <Text style={{ color: colors.textSecondary, marginTop: 15 }}>All caught up!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20, // Move downward
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  listContent: { padding: 20 },
  notiItem: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 2,
    shadowOpacity: 0.05,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notiInfo: { flex: 1 },
  notiHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  notiTitle: { fontSize: 15, fontWeight: 'bold' },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  notiMsg: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  notiTime: { fontSize: 11, color: '#94A3B8', fontWeight: 'bold' },
  emptyBox: { marginTop: 150, alignItems: 'center' },
});

export default NotificationScreen;

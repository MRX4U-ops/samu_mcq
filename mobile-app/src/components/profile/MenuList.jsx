import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { 
  Settings, Bell, Moon, Sun, 
  Smartphone, LogOut, ChevronRight,
  Bookmark, AlertCircle, RefreshCw, LayoutDashboard, HelpCircle
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import useAuthStore from '../../store/authStore';

const MenuList = ({ colors, isDarkMode, toggleTheme, onLogout }) => {
  const navigation = useNavigation();
  const { isAdmin } = useAuthStore();

  const sections = [
    {
      title: 'LEARNING CONTROL',
      items: [
        { 
          label: 'Bookmarked Questions', 
          icon: Bookmark, 
          color: '#F59E0B',
          onPress: () => navigation.navigate('SavedQuestions')
        },
        { label: 'Wrong Questions List', icon: AlertCircle, color: '#EF4444' },
        { label: 'Retry Option', icon: RefreshCw, color: '#10B981' },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { label: 'Dark Mode', icon: isDarkMode ? Sun : Moon, color: isDarkMode ? '#FBBF24' : '#6366F1', type: 'toggle' },
        { label: 'Notifications', icon: Bell, color: '#6366F1', type: 'toggle' },
        { 
          label: 'Help & Support', 
          icon: HelpCircle, 
          color: '#8B5CF6', 
          onPress: () => navigation.navigate('HelpDesk') 
        },
        { label: 'Device Management', icon: Smartphone, color: '#64748B', sub: 'Max 2 devices' },
      ]
    }
  ];

  if (isAdmin()) {
    sections.unshift({
      title: 'ADMINISTRATION',
      items: [
        { 
          label: 'Admin Dashboard', 
          icon: LayoutDashboard, 
          color: '#6366F1', 
          onPress: () => navigation.navigate('AdminDashboard') 
        },
      ]
    });
  }

  return (
    <View style={styles.container}>
      {sections.map((section, sIdx) => (
        <View key={sIdx} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={[styles.menu, { backgroundColor: colors.surface }]}>
            {section.items.map((item, iIdx) => (
              <TouchableOpacity 
                key={iIdx} 
                style={[styles.item, iIdx !== section.items.length - 1 && styles.border]}
                onPress={item.onPress}
              >
                <View style={[styles.iconBox, { backgroundColor: item.color + '10' }]}>
                  <item.icon size={20} color={item.color} />
                </View>
                <View style={styles.content}>
                  <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
                  {item.sub && <Text style={styles.subText}>{item.sub}</Text>}
                </View>
                {item.type === 'toggle' ? (
                  <Switch 
                    value={item.label === 'Dark Mode' ? isDarkMode : true} 
                    onValueChange={item.label === 'Dark Mode' ? toggleTheme : null}
                    trackColor={{ false: '#CBD5E1', true: '#A5B4FC' }}
                    thumbColor={isDarkMode ? '#6366F1' : '#F1F5F9'}
                  />
                ) : (
                  <ChevronRight size={18} color="#94A3B8" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <LogOut size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Sign Out Professionally</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#94A3B8',
    marginBottom: 10,
    marginLeft: 10,
    letterSpacing: 1.2,
  },
  menu: {
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 2,
    shadowOpacity: 0.05,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  subText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  logoutBtn: {
    marginTop: 10,
    height: 60,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FFF5F5',
  },
  logoutText: {
    marginLeft: 12,
    fontWeight: 'bold',
    fontSize: 15,
    color: '#EF4444',
  },
});

export default MenuList;

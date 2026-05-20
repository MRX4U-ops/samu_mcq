import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Linking } from 'react-native';
import { Globe, Layout, ExternalLink, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import TopHeader from '../components/TopHeader';

const WebsiteOptionScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const SSMU_URL = 'https://mt.sammu.uz/login/index.php';

  const handleOpenInBrowser = () => {
    Linking.openURL(SSMU_URL).catch((err) => console.error("Couldn't load page", err));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F0F5F9' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SSMU Website</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.globePulse}>
            <Globe size={60} color="#3B82F6" strokeWidth={1.5} />
          </View>
        </View>

        <Text style={styles.mainTitle}>Access SSMU Portal</Text>
        <Text style={styles.description}>
          Choose how you would like to view the Samarkand State Medical University website.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.optionButton, styles.primaryButton]}
            onPress={() => navigation.navigate('WebView', { url: SSMU_URL })}
          >
            <View style={styles.buttonIconBox}>
              <Layout size={24} color="#FFF" />
            </View>
            <View style={styles.buttonTextContent}>
              <Text style={styles.buttonLabel}>Open Inside App</Text>
              <Text style={styles.buttonSub}>Seamless integration with app navigation</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionButton, styles.secondaryButton]}
            onPress={handleOpenInBrowser}
          >
            <View style={[styles.buttonIconBox, { backgroundColor: '#E0E7FF' }]}>
              <ExternalLink size={24} color="#6366F1" />
            </View>
            <View style={styles.buttonTextContent}>
              <Text style={[styles.buttonLabel, { color: '#1E293B' }]}>Open in Browser</Text>
              <Text style={styles.buttonSub}>Use your favorite mobile browser</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Official SSMU E-Learning Platform</Text>
      </View>
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
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  globePulse: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  buttonIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  buttonTextContent: {
    flex: 1,
  },
  buttonLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFF',
  },
  buttonSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  }
});

export default WebsiteOptionScreen;

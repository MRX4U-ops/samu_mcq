import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const [updateStatus, setUpdateStatus] = useState('Initializing Clinical Repository...');

  useEffect(() => {
    let isMounted = true;

    async function onFetchUpdateAsync() {
      let navigated = false;

      const goToLogin = () => {
        if (!navigated && isMounted && navigation) {
          navigated = true;
          navigation.replace('Login');
        }
      };

      try {
        // FAIL-SAFE: Check if Updates module exists before using it
        let Updates;
        try {
          Updates = require('expo-updates');
        } catch (e) {
          console.log('OTA Updates module not found, skipping check.');
        }

        if (Updates && !__DEV__) {
          setUpdateStatus('Checking for new updates...');
          const update = await Updates.checkForUpdateAsync();

          if (update.isAvailable) {
            setUpdateStatus('New update found! Downloading...');
            await Updates.fetchUpdateAsync();
            setUpdateStatus('Applying update, please wait...');
            
            try {
              const { sendLocalNotification } = require('../services/notificationService');
              await sendLocalNotification(
                'Update Successful ✨', 
                'SAMU MCQs has just been updated to the latest version!'
              );
            } catch (e) {
              console.log('Failed to send update notification:', e);
            }

            // reloadAsync will restart the app — no need to navigate
            await Updates.reloadAsync();
            return; // App will restart; nothing below runs
          }
        }

        // No update available or skipped — proceed normally
        setUpdateStatus('Up to date! Loading app...');
        setTimeout(goToLogin, 1000);
      } catch (error) {
        console.log(`Update check error: ${error.message}`);
        setUpdateStatus('Loading app...');
        setTimeout(goToLogin, 1000);
      }
    }

    onFetchUpdateAsync();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
        <Text style={styles.statusText}>{updateStatus}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Clinical Excellence • Professional Edition</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    width: width * 0.6,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  loader: { marginTop: 40 },
  statusText: {
    marginTop: 20,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  footer: {
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    letterSpacing: 1.5,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default SplashScreen;

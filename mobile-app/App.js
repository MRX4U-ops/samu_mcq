import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/RootNavigation';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

export default function App() {
  useEffect(() => {
    async function checkAutoUpdate() {
      if (__DEV__) return;
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            "New Update Installed",
            "Latest questions and features have been downloaded over the air. Restart now to apply?",
            [
              { text: "Later", style: "cancel" },
              { 
                text: "Restart Now", 
                onPress: async () => {
                  await Updates.reloadAsync();
                } 
              }
            ]
          );
        }
      } catch (e) {
        console.log('[OTA Updates] Check failed:', e.message);
      }
    }
    checkAutoUpdate();
  }, []);

  return (
    <ThemeProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="auto" />
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}

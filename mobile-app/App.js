import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/RootNavigation';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import useAuthStore from './src/store/authStore';

export default function App() {
  useEffect(() => {
    // 1. Initialize auth session
    useAuthStore.getState().initialize();

    // 2. Fail-safe: guarantee the app never stays stuck in loading
    const safetyTimer = setTimeout(() => {
      if (useAuthStore.getState().loading) {
        useAuthStore.setState({ loading: false });
      }
    }, 2500);

    // 3. Background OTA update check
    async function checkAutoUpdate() {
      if (__DEV__) return;
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (e) {
        console.log('[OTA Updates] Check failed:', e.message);
      }
    }
    checkAutoUpdate();

    return () => clearTimeout(safetyTimer);
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

import 'react-native-url-polyfill/auto';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

import { ThemeProvider } from './src/context/ThemeContext';
import useAuthStore from './src/store/authStore';

import { navigationRef } from './src/navigation/RootNavigation';
import { 
  registerForPushNotificationsAsync, 
  setupNotificationListeners 
} from './src/services/notificationService';

export default function App() {
  const { user, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (user) {
      // Register for push tokens once logged in
      registerForPushNotificationsAsync(user.id);
      
      // Setup listeners for foreground and taps
      const cleanup = setupNotificationListeners({
        navigate: (name, params) => navigationRef.current?.navigate(name, params)
      });
      
      return cleanup;
    }
  }, [user]);

  return (
    <ThemeProvider>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}


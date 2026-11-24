import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/RootNavigation';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="auto" />
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}

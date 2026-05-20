import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const value = await AsyncStorage.getItem('ssmu_dark_mode');
        if (value !== null) {
          setIsDarkMode(value === 'true');
        } else {
          setIsDarkMode(systemColorScheme === 'dark');
        }
      } catch (e) {
        console.log('Error loading theme:', e);
      }
    };
    loadThemePreference();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    try {
      const nextTheme = !isDarkMode;
      setIsDarkMode(nextTheme);
      await AsyncStorage.setItem('ssmu_dark_mode', String(nextTheme));
    } catch (e) {
      console.log('Error saving theme:', e);
    }
  };

  const theme = {
    isDarkMode,
    colors: isDarkMode ? darkColors : lightColors,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

const lightColors = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  primary: '#3B82F6',
  accent: '#6366F1',
  border: '#E5E7EB',
  card: '#FFFFFF',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  questionBg: '#DEF1FB', // Light Blue/Cyan from user screenshot
  questionText: '#1E3A8A', // Deep Blue for readability
};

const darkColors = {
  background: '#0F172A', // Deep Midnight Blue
  surface: '#1E293B',    // Slate Blue
  text: '#F8FAFC',       // Off White
  textSecondary: '#94A3B8', // Muted Slate
  primary: '#3882F6',
  accent: '#818CF8',
  border: '#334155',
  card: '#1E293B',
  success: '#34D399',
  error: '#F87171',
  warning: '#FBBF24',
  questionBg: '#1E293B', // Slate blue for dark mode
  questionText: '#F8FAFC', // Off white for dark mode
};

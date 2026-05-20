import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import { supabase } from './supabaseClient';

let Notifications = null;
const isExpoGoAndroid = Platform.OS === 'android' && Constants.appOwnership === 'expo';

if (!isExpoGoAndroid) {
  Notifications = require('expo-notifications');
  
  // Configure how notifications are handled when the app is open
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export const registerForPushNotificationsAsync = async (userId) => {
  if (Platform.OS === 'android' && Constants.appOwnership === 'expo') {
    console.log('Skipping push notification setup in Expo Go on Android (Not supported in SDK 53+).');
    return null;
  }

  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  // Get FCM token
  const token = (await Notifications.getDevicePushTokenAsync()).data;
  console.log('FCM Token:', token);

  if (userId) {
    try {
      const { error } = await supabase
        .from('device_tokens')
        .upsert({ 
          user_id: userId, 
          fcm_token: token, 
          os: Platform.OS,
          device_name: Device.modelName,
          last_seen: new Date().toISOString()
        }, { onConflict: 'fcm_token' });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving token to Supabase:', err.message);
    }
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
};

// Listeners
export const setupNotificationListeners = (navigation) => {
  if (!Notifications) {
    return () => {};
  }

  // Foreground listener
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification Received in Foreground:', notification);
  });

  // Response listener (user tapped notification)
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    console.log('Notification Tapped:', data);

    if (data.screen) {
      navigation.navigate(data.screen, data.params || {});
    }
  });

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
};

export const sendLocalNotification = async (title, body, data = {}) => {
  if (!Notifications) return;
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // send immediately
  });
};

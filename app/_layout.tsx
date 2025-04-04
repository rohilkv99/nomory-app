import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { configureNotificationHandler } from '../utils/notifications';
import { Platform } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      configureNotificationHandler();
    }
  }, []);
  return (
    <Stack
      screenOptions={{
        headerShown: false, // ✅ disables all headers globally
      }}
    />
  );
}
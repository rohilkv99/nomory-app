import * as Notifications from 'expo-notifications';
import { Alert, Linking, Platform } from 'react-native';

export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();

  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED) {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== 'granted') {
    Alert.alert(
      'Notifications Disabled',
      'To receive expiry reminders, please enable notifications in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
    return false;
  }

  return true;
}

// Call this once early in app (e.g., from App.tsx or root layout)
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// Schedules a reminder X days before the expiry date (default 1)
export async function scheduleExpiryReminder(
  productName: string,
  storeName: string,
  expiryDate: Date,
  daysBefore: number = 1, //By Default 1 day
  notifyHour: number = 10, //By Default 10 am
  notifyMinute: number = 0 
) {
  const triggerDate = new Date(expiryDate);
  triggerDate.setDate(triggerDate.getDate() - daysBefore);

  // Optional: set reminder time (e.g., 10 AM)
  triggerDate.setHours(notifyHour); // Optional: 10 AM
  triggerDate.setMinutes(notifyMinute);
  triggerDate.setSeconds(0);

  const now = new Date();

  // Skip scheduling if it's in the past
  if (triggerDate <= now) {
    // Fallback: test notification immediately (in 10 seconds)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Expiry Reminder (Fallback)',
        body: `${productName} from ${storeName} expires soon!`,
        sound: true,
      },
      trigger: {
        type: 'timeInterval',
        seconds: 10,
        repeats: false,
      } as any,
    });
    return;
  }
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Product Expiry Reminder',
      body: `${productName || 'Your item'} from ${storeName || 'your store'} expires in ${daysBefore} day(s)!`,
      sound: true,
    },
    trigger: {
      type: 'calendar',
      year: triggerDate.getFullYear(),
      month: triggerDate.getMonth() + 1,
      day: triggerDate.getDate(),
      hour: triggerDate.getHours(),
      minute: triggerDate.getMinutes(),
      second: 0,
      repeats: false,
    } as any // Optional: add `as any` if strict typing still complains
  });
}
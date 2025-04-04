import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Button, Alert, StyleSheet, Platform, TextInput, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { db } from '../../firebaseConfig';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { requestNotificationPermission, scheduleExpiryReminder } from '../../utils/notifications';

export const options = {
  headerShown: false,
};

export default function ExpiryPicker() {
  const { barcode } = useLocalSearchParams();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(true); // Date picker
  const [productName, setProductName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [daysBefore, setDaysBefore] = useState('1'); // default: 1 day before

  const [reminderTime, setReminderTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) return;

      // ⏰ Schedule local notification with custom day and time
      await scheduleExpiryReminder(
        productName,
        storeName,
        selectedDate,
        parseInt(daysBefore),
        reminderTime.getHours(),
        reminderTime.getMinutes()
      );

      // Save to Firestore
      await addDoc(collection(db, 'products'), {
        barcode,
        productName,
        storeName,
        expiryDate: selectedDate.toISOString(),
        scannedAt: serverTimestamp(),
      });

      router.replace({
        pathname: '/',
        params: { saved: '1' }
      });    
    } catch (error) {
      console.error('❌ Failed to save:', error);
      Alert.alert('Error', 'Could not save to Firestore');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>

      <TextInput
        placeholder="Enter product name"
        value={productName}
        onChangeText={setProductName}
        style={styles.input}
      />

      <TextInput
        placeholder="Enter store name"
        value={storeName}
        onChangeText={setStoreName}
        style={styles.input}
      />

      <Text style={styles.title}>Select Expiry Date</Text>

      {/* Android Date Picker */}
      {Platform.OS === 'android' && showPicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(_, date) => {
              if (date) {
                setSelectedDate(date);
              }
              setShowPicker(false);
            }}
          />
        </View>
      )}

      {/* iOS Date Picker */}
      {Platform.OS === 'ios' && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            onChange={(_, date) => {
              if (date) setSelectedDate(date);
            }}
            textColor="black"
            style={styles.iosPicker}
          />
        </View>
      )}

      {/* Days before input */}
      <View style={{ marginTop: 16 }}>
        <Text>Remind me how many days before expiry?</Text>
        <TextInput
          keyboardType="numeric"
          value={daysBefore}
          onChangeText={setDaysBefore}
          placeholder="Enter days before (e.g. 1)"
          style={{ borderBottomWidth: 1, padding: 8 }}
        />
      </View>

      {/* Time Picker */}
      <View style={{ marginTop: 16 }}>
        <Text>Choose reminder time:</Text>
        <Pressable
          onPress={() => setShowTimePicker(true)}
          style={{
            padding: 10,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            marginTop: 8,
            marginBottom: 16
          }}
        >
          <Text>{reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </Pressable>
        {showTimePicker && (
          <DateTimePicker
            value={reminderTime}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) {
                setReminderTime(selectedTime);
              }
            }}
          />
        )}
      </View>

      <Button title="Save Expiry Date" onPress={handleSave} disabled={saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  pickerContainer: {
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  iosPicker: {
    height: 150,
  },
});

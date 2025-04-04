import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Button, Alert, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { db } from '../../firebaseConfig';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export const options = {
  headerShown: false,
};

export default function ExpiryPicker() {
  const { barcode } = useLocalSearchParams();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(true); // Controls visibility of picker

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      await addDoc(collection(db, 'products'), {
        barcode,
        expiryDate: selectedDate.toISOString(),
        scannedAt: serverTimestamp(),
      });

      router.push({
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
      <Text style={styles.title}>Select Expiry Date</Text>
  
      {/* Android Picker */}
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
  
      {/* iOS Picker */}
      {Platform.OS === 'ios' && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            onChange={(_, date) => {
              if (date) setSelectedDate(date);
            }}
            textColor="black" // 👈 only works on iOS
            style={styles.iosPicker}
          />
        </View>
      )}
  
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
    backgroundColor: '#e0e0e0', // ⬅️ darker than #f0f0f0
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
  },
  iosPicker: {
    height: 150,
  },
});


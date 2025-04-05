import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, Pressable, Linking, Platform, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useRouter } from 'expo-router';

export const options = {
    headerShown: false,
};  

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    
    // Optional: console.log scanned type and data
    console.log(`Scanned Type: ${type}, Data: ${data}`);
  
    // Delay navigation slightly to let the camera stop smoothly
    setTimeout(() => {
      router.replace(`/modal/expiry?barcode=${data}`);
      setScanned(false); // reset after navigating
    }, 500);
  };  

  if (!permission) {
    return (
      <SafeAreaView style={styles.messageContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.messageText}>Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }
  
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.messageContainer}>
        <Text style={styles.messageText}>Camera permission is required to scan barcodes.</Text>
        <Pressable
          onPress={() => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }}
          style={styles.settingsButton}
        >
          <Text style={styles.settingsButtonText}>Open Settings</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'], // only standard barcodes
            }}
        />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#000', // Optional: matches camera background
  },
  messageText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  settingsButton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  settingsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
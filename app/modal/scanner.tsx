import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
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

  if (!permission) return <Text>Requesting camera permission...</Text>;
  if (!permission.granted) return <Text>No access to camera</Text>;

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
});
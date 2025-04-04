import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

export const options = {
  headerShown: false,
};

export default function Index() {
  const router = useRouter();
  const { saved } = useLocalSearchParams();

  useEffect(() => {
    if (saved) {
      Alert.alert('✅ Product saved successfully!', undefined, [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/'); // resets stack so expiry tab disappears
          },
        },
      ]);
    }
  }, [saved]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Nomory</Text>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search items"
          style={styles.searchInput}
          editable={false} // we’ll enable this later
        />
        <TouchableOpacity
          onPress={() => router.push('/modal/scanner')}
          style={styles.iconButton}
        >
          <Ionicons name="barcode-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* ✅ Show popup if saved */}
      {/* You can show this conditionally in future */}
      {/* Alert.alert('✅ Item saved!') could be triggered here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  iconButton: {
    paddingLeft: 10,
  },
});
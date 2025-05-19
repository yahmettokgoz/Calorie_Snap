import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';

export default function PhotoResultScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const router = useRouter();

  const handleUpload = async () => {
  if (!photoUri) {
    Alert.alert('Hata', 'Fotoğraf bulunamadı.');
    return;
  }

  try {
    const base64 = await FileSystem.readAsStringAsync(photoUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const response = await fetch('http://10.0.2.2:5000/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: 'photo.jpg',
        image_data: base64,
      }),
    });

    const result = await response.json();
    console.log('✅ Upload sonucu:', result);

    const predictResponse = await fetch('http://10.0.2.2:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: 'photo.jpg' }),
    });

    const predictResult = await predictResponse.json();
    Alert.alert('Tahmin Sonucu', predictResult.prediction);

  } catch (error) {
    console.error('🚨 Hata:', error);
    Alert.alert('Hata', 'Bir şeyler ters gitti.');
  }
};

  return (
    <View style={styles.container}>
      {photoUri ? (
        <>
          <Image source={{ uri: photoUri }} style={styles.image} />
          <Text style={styles.successText}>Fotoğraf başarıyla çekildi 📸</Text>
          <TouchableOpacity style={styles.button} onPress={handleUpload}>
            <Text style={styles.buttonText}>Fotoğrafı Gönder ve Tahmin Al</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.errorText}>Fotoğraf URI alınamadı.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  successText: {
    fontSize: 16,
    marginBottom: 16,
    color: 'green',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function PhotoCaptureScreen() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('İzin Gerekli', 'Kamera erişimi gerekli.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const photoUri = result.assets[0].uri;
      setPreview(photoUri);

      try {
        console.log('📥 Fotoğraf URI:', photoUri);

        const base64 = await FileSystem.readAsStringAsync(photoUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // 📤 Fotoğrafı backend'e gönder
        const uploadResponse = await fetch('http://10.0.2.2:5000/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: 'photo.jpg',
            image_data: base64,
          }),
        });

        const uploadResult = await uploadResponse.json();
        console.log('✅ Upload:', uploadResult);

        if (!uploadResponse.ok || !uploadResult.filename) {
          Alert.alert('Yükleme Hatası', 'Sunucu fotoğrafı kabul etmedi.');
          return;
        }

        // 🧠 Tahmin isteği
        const predictResponse = await fetch('http://10.0.2.2:5000/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filename: uploadResult.filename }),
        });

        const predictResult = await predictResponse.json();
        console.log('✅ Tahmin:', predictResult);

        Alert.alert('Tahmin Sonucu', predictResult.prediction);

      } catch (error) {
        console.error('🚨 Hata:', error);
        Alert.alert('Hata', 'Bir şeyler ters gitti.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {preview && <Image source={{ uri: preview }} style={styles.preview} />}

      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>📸 Öğün Fotoğrafı Çek</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  preview: {
    width: 300,
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

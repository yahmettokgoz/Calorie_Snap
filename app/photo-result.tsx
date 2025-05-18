import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function PhotoResultScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const router = useRouter();

  const handleUpload = async () => {
    if (!photoUri) {
      Alert.alert('Hata', 'Fotoğraf bulunamadı.');
      return;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: photoUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      // 1. FOTOĞRAFI GÖNDER
      const uploadResponse = await fetch('http://192.168.1.105:5000/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload başarısız');
      }

      const uploadResult = await uploadResponse.json();
      const filename = uploadResult.filename;

      console.log('Yükleme başarılı. Dosya adı:', filename);

      // 2. TAHMİN İSTEĞİ GÖNDER
      const predictResponse = await fetch('http://192.168.1.105:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      if (!predictResponse.ok) {
        throw new Error('Tahmin başarısız');
      }

      const predictResult = await predictResponse.json();
      console.log('Tahmin sonucu:', predictResult);

      Alert.alert('Tahmin Sonucu', `Bu yiyecek: ${predictResult.prediction}`);

    } catch (error) {
      console.error('Yükleme Hatası:', error);
      Alert.alert('Hata', 'Fotoğraf yüklenirken bir hata oluştu.');
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

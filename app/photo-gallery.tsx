import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';

export default function PhotoGalleryScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert('Uyarı', 'Lütfen önce bir fotoğraf seçin.');
      return;
    }

    try {
      console.log('🖼️ Galeri URI:', selectedImage);

      const base64 = await FileSystem.readAsStringAsync(selectedImage, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const uploadResponse = await fetch('http://192.168.1.101:5000/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: 'gallery_photo.jpg',
          image_data: base64,
        }),
      });

      const uploadResult = await uploadResponse.json();
      console.log('✅ Upload:', uploadResult);

      if (!uploadResponse.ok || !uploadResult.filename) {
        Alert.alert('Yükleme Hatası', 'Sunucu fotoğrafı kabul etmedi.');
        return;
      }

      const predictResponse = await fetch('http://192.168.1.101:5000/predict', {
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
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>🖼️ Galeriden Fotoğraf Seç</Text>
      </TouchableOpacity>

      {selectedImage && (
        <>
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
            <Text style={styles.uploadButtonText}>📤 Fotoğrafı Gönder ve Tahmin Al</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  imagePreview: {
    width: 300,
    height: 300,
    marginTop: 20,
    borderRadius: 10,
  },
  uploadButton: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

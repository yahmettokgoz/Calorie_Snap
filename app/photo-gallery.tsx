import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';

export default function PhotoGalleryScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      alert('Lütfen önce bir fotoğraf seçin!');
      return;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: selectedImage,
      name: 'upload.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);

    try {
      const uploadResponse = await fetch('http://192.168.1.100:5000/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Sunucudan başarısız yanıt alındı.');
      }

      const uploadData = await uploadResponse.json();
      const filename = uploadData.filename;

      // 🔁 Fotoğraf yüklendikten sonra tahmin isteği gönder
      const predictResponse = await fetch('http://192.168.1.100:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      if (!predictResponse.ok) {
        throw new Error('Tahmin isteği başarısız oldu.');
      }

      const predictionData = await predictResponse.json();
      const predictedFood = predictionData.prediction;

      Alert.alert('Tahmin Sonucu', `📷 Bu yiyecek: ${predictedFood}`);
    } catch (error) {
      console.error('Hata:', error);
      alert('Fotoğraf yüklenirken veya tahmin yapılırken bir hata oluştu.');
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
            <Text style={styles.uploadButtonText}>📤 Fotoğrafı Yükle</Text>
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

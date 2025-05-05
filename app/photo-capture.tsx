import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function PhotoCaptureScreen() {
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back');
  const [takenPhoto, setTakenPhoto] = useState<any>(null);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission || !permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Kamera izni verilmedi. Lütfen izin verin.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>İzin Ver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (!photo) {
        Alert.alert('Hata', 'Fotoğraf çekilemedi.');
        return;
      }
      setTakenPhoto(photo);

      const formData = new FormData();
      const photoName = `${Date.now()}.jpg`;

      formData.append('file', {
        uri: photo.uri,
        name: photoName,
        type: 'image/jpeg',
      } as any);

      try {
        // 1. 📤 Fotoğrafı yükle
        const uploadResponse = await fetch('http://192.168.1.100:5000/upload', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Sunucuya yükleme başarısız.');
        }

        const uploadData = await uploadResponse.json();
        const filename = uploadData.filename;

        // 2. 🔍 Tahmin yap
        const predictResponse = await fetch('http://192.168.1.100:5000/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filename }),
        });

        if (!predictResponse.ok) {
          throw new Error('Tahmin işlemi başarısız.');
        }

        const predictionData = await predictResponse.json();
        const predictedFood = predictionData.prediction;

        Alert.alert('Tahmin Sonucu', `📷 Bu yiyecek: ${predictedFood}`);
        router.push('/home');
      } catch (error) {
        console.error('Tahmin Hatası:', error);
        Alert.alert('Hata', 'Fotoğraf yüklenirken veya tahmin yapılırken hata oluştu.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing={cameraType} />

      {takenPhoto && (
        <Image source={{ uri: takenPhoto.uri }} style={styles.preview} />
      )}

      <TouchableOpacity style={styles.button} onPress={takePicture}>
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
  },
  camera: {
    width: '90%',
    height: '50%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  preview: {
    width: 300,
    height: 300,
    marginTop: 20,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

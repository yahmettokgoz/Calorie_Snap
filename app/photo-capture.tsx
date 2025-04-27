import { Camera, CameraView, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useRef, useState, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function PhotoCaptureScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
  
      if (photo && photo.uri) {   // 💬 Burada güvenceye alıyoruz
        console.log('Çekilen Foto:', photo.uri);
        setPhotoUri(photo.uri);
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        
        router.push({
          pathname: '/photo-result',
          params: { photoUri: photo.uri },
        });
      } else {
        console.log('Fotoğraf çekilemedi.');
      }
    }
  };
  
  

  if (hasCameraPermission === null) {
    return (
      <View style={styles.centered}>
        <Text>İzinler kontrol ediliyor...</Text>
      </View>
    );
  }

  if (hasCameraPermission === false) {
    return (
      <View style={styles.centered}>
        <Text>Kamera izni verilmedi.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.preview} />
      ) : (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
        />
      )}
      <TouchableOpacity style={styles.button} onPress={takePicture}>
        <Text style={styles.buttonText}>📸 Fotoğraf Çek</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  preview: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: { color: 'white', fontSize: 16 },
});

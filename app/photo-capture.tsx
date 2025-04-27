import { CameraView, Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useRef, useState, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PhotoCaptureScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back'); // 👈 String değer!

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync(); // 👈 Burada doğru yerden izin alıyoruz
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();

      if (photo?.uri) { // 👈 Güvenli kontrol
        console.log('Çekilen Foto:', photo.uri);
        await MediaLibrary.saveToLibraryAsync(photo.uri);
      }
    }
  };

  if (hasCameraPermission === null) {
    return <View><Text>İzin kontrol ediliyor...</Text></View>;
  }
  if (hasCameraPermission === false) {
    return <View><Text>Kamera izni yok!</Text></View>;
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={cameraType} />
      <TouchableOpacity style={styles.button} onPress={takePicture}>
        <Text style={styles.buttonText}>📸 Fotoğraf Çek</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
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

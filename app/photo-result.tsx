import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function PhotoResultScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const router = useRouter();

  const handleUpload = async () => {
    console.log('Fotoğraf gönderme butonuna basıldı.');
    // Buraya fotoğrafı backend'e gönderme işlemini ekleyeceğiz.
  };

  return (
    <View style={styles.container}>
      {photoUri ? (
        <>
          <Image source={{ uri: photoUri }} style={styles.image} />
          <Text style={styles.successText}>Fotoğraf başarıyla çekildi 📸</Text>

          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
            <Text style={styles.buttonText}>📤 Fotoğrafı Gönder</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text>Fotoğraf bulunamadı.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  image: { width: '100%', height: 400, borderRadius: 10, marginBottom: 20 },
  successText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  uploadButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: { color: 'white', fontSize: 16 },
});

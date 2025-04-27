import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => router.push('./meal-add')}>
        <Text style={styles.buttonText}>🍽️ Yemek Ekle</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('./progress')}>
        <Text style={styles.buttonText}>📈 İlerlemeni Gör</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('./photo-capture')}>
        <Text style={styles.buttonText}>📷 Öğün Çek (Fotoğraf)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('./photo-gallery')}>
        <Text style={styles.buttonText}>🖼️ Öğün Yükle (Galeri)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

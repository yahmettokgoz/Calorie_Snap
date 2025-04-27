import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { auth, db } from '../components/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function UserInfoScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const [isim, setIsim] = useState('');
  const [soyisim, setSoyisim] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else router.replace('/login');
    });
    return unsubscribe;
  }, []);

  const handleContinue = async () => {
    if (!isim || !soyisim || !gender || !age || !weight || !height) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      await setDoc(doc(db, 'profiles', user.uid), {
        isim,
        soyisim,
        gender,
        age: Number(age),
        weight: Number(weight),
        height: Number(height),
      });
      router.replace('/home');
    } catch (err) {
      Alert.alert('Hata', 'Veriler kaydedilemedi.');
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kişisel Bilgilerini Gir</Text>

      <TextInput
        placeholder="İsim"
        style={styles.input}
        value={isim}
        onChangeText={setIsim}
      />

      <TextInput
        placeholder="Soyisim"
        style={styles.input}
        value={soyisim}
        onChangeText={setSoyisim}
      />

      <TextInput
        placeholder="Yaş"
        keyboardType="numeric"
        style={styles.input}
        value={age}
        onChangeText={setAge}
      />

      <TextInput
        placeholder="Kilo (kg)"
        keyboardType="numeric"
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
      />

      <TextInput
        placeholder="Boy (cm)"
        keyboardType="numeric"
        style={styles.input}
        value={height}
        onChangeText={setHeight}
      />

      <View style={styles.genderButtons}>
        <TouchableOpacity
          style={[styles.genderButton, gender === 'Erkek' && styles.selectedGender]}
          onPress={() => setGender('Erkek')}>
          <Text>Erkek</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.genderButton, gender === 'Kadın' && styles.selectedGender]}
          onPress={() => setGender('Kadın')}>
          <Text>Kadın</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Kaydet ve Devam Et</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  genderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  genderButton: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  selectedGender: {
    backgroundColor: '#4CAF50',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  continueText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

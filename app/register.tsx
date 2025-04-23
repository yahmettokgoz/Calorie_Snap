import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../components/firebaseConfig';
import { useRouter } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';

export default function RegisterScreen() {
  const router = useRouter();
  const [isim, setIsim] = useState('');
  const [soyisim, setSoyisim] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!isim || !soyisim || !email || !password) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        isim: isim,
        soyisim: soyisim,
        email: email
      });

      // ✅ Alert tamamlandıktan sonra yönlendirme
      Alert.alert(
        "Yeni kullanıcı eklendi.",
        "Giriş sayfasına yönlendiriliyorsunuz.",
        [
          {
            text: "Tamam",
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Kayıt Hatası", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>
      <TextInput style={styles.input} placeholder="İsim" value={isim} onChangeText={setIsim} />
      <TextInput style={styles.input} placeholder="Soyisim" value={soyisim} onChangeText={setSoyisim} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Şifre" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Hesap Oluştur" onPress={handleRegister} />
      <Text style={styles.loginText} onPress={() => router.push('/login')}>
        Zaten hesabınız var mı? Giriş yap
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
  loginText: { marginTop: 20, color: 'blue', textAlign: 'center' }
});

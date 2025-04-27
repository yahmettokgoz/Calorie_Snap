import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../components/firebaseConfig'; // Doğru yol: components/ dizini altında


export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login'); // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
      } else {
        router.replace('/home'); // Kullanıcı giriş yaptıysa home sayfasına yönlendir
      }
    });

    return () => unsubscribe();
  }, [router]);

  return <>{children}</>;
}

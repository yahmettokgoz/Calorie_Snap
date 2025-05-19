import { db } from '../../components/firebaseConfig';
import { deleteDoc, doc } from 'firebase/firestore';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export async function saveMealToFirestore(mealData: {
  meal_name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  image_path?: string;
}) {
  try {
    const mealWithTimestamp = {
      ...mealData,
      created_at: Timestamp.now(),
    };

    await addDoc(collection(db, 'meals'), mealWithTimestamp);
    console.log('✅ Firestore’a kaydedildi:', mealWithTimestamp);
  } catch (error) {
    console.error('❌ Firestore’a kaydedilemedi:', error);
  }
}


export const deleteMealFromFirestore = async (mealId: string) => {
  try {
    await deleteDoc(doc(db, 'meals', mealId));
    console.log('🗑️ Meal silindi:', mealId);
  } catch (error) {
    console.error('❌ Silme hatası:', error);
  }
};
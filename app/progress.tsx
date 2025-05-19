import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { db } from '../components/firebaseConfig';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router';

interface Meal {
  id: string;
  meal_name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  meal_time: string;
}

export default function ProgressScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  });

  const router = useRouter();

  const fetchMeals = async () => {
    const querySnapshot = await getDocs(collection(db, 'meals'));
    const mealList: Meal[] = [];
    let tCalories = 0, tProtein = 0, tFat = 0, tCarbs = 0;

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data() as Omit<Meal, 'id'>;
      const meal: Meal = { id: docSnap.id, ...data };
      mealList.push(meal);
      tCalories += data.calories;
      tProtein += data.protein;
      tFat += data.fat;
      tCarbs += data.carbs;
    });

    setMeals(mealList);
    setTotals({
      calories: tCalories,
      protein: tProtein,
      fat: tFat,
      carbs: tCarbs,
    });
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'meals', id));
    await fetchMeals(); // Anlık güncelleme için
  };

  const renderMealsByTime = (time: string) => {
    const filtered = meals.filter(m => m.meal_time === time);
    if (filtered.length === 0) return null;

    return (
      <View style={styles.mealGroup}>
        <Text style={styles.mealTime}>{time.charAt(0).toUpperCase() + time.slice(1)}</Text>
        {filtered.map((item, index) => (
          <View key={index} style={styles.mealItemRow}>
            <Text style={styles.mealItemText}>
              {item.meal_name} - {item.calories.toFixed(0)} kcal
            </Text>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteButtonText}>Sil</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            Carbs: {totals.carbs.toFixed(1)}g Protein: {totals.protein.toFixed(1)}g Fat:{' '}
            {totals.fat.toFixed(1)}g Calories: {totals.calories.toFixed(0)} kcal
          </Text>
        </View>

        {renderMealsByTime('breakfast')}
        {renderMealsByTime('lunch')}
        {renderMealsByTime('dinner')}
      </ScrollView>

      {/* + Butonu */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/meal-add')}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: '#f9f9f9',
  },
  summaryBox: {
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  summaryText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  mealGroup: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 2,
  },
  mealTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 8,
  },
  mealItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealItemText: {
    fontSize: 15,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#e53935',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
});

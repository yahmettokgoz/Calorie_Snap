import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useState } from 'react';
import { db } from '../components/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type Meal = {
  meal_name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  meal_time: string;
  user_id: string;
};

const saveMealToFirestore = async (meal: Meal) => {
  try {
    await addDoc(collection(db, 'meals'), {
      ...meal,
      created_at: serverTimestamp(),
    });
    console.log('✅ Firestore: Meal kaydedildi');
  } catch (error) {
    console.error('❌ Firestore Hatası:', error);
  }
};

export default function MealAddScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:5000/search-foods?query=${searchQuery}`);
      if (!response.ok) throw new Error('Sunucu hatası');

      const data = await response.json();
      if (!data || !Array.isArray(data.foods)) throw new Error('Beklenmeyen veri formatı');

      const mappedResults = data.foods.map((item: any, index: number) => ({
        name: item.name || `Unnamed-${index}`,
        calories: item.calories || 0,
      }));

      setSearchResults(mappedResults);
    } catch (error) {
      console.error('Arama hatası:', error);
      alert('Besin aranırken bir hata oluştu.');
    }
  };

  const handleSelectFood = (food: any) => {
    setSelectedFood(food);
    setShowModal(true);
  };

  const handleMealTimeSelection = async (mealTime: string) => {
    if (!selectedFood) return;

    try {
      const response = await fetch('http://10.0.2.2:5000/food-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ food_name: selectedFood.name }),
      });

      if (!response.ok) throw new Error('Sunucu hatası');
      const data = await response.json();
      console.log('📦 Besin Detayları:', data);

      // Firestore'a ekleme
      await saveMealToFirestore({
        meal_name: selectedFood.name,
        calories: data.calories,
        protein: data.protein,
        fat: data.fat,
        carbs: data.carbs,
        meal_time: mealTime,
        user_id: "test_user", // Oturum açan kullanıcıya göre değişecek
      });

      alert(
        `${selectedFood.name} (${mealTime})\nKalori: ${data.calories} kcal\nProtein: ${data.protein}g\nYağ: ${data.fat}g\nKarbonhidrat: ${data.carbs}g`
      );
      setShowModal(false);
    } catch (error) {
      console.error('Besin detayları alınamadı:', error);
      alert('Besin detayları alınırken hata oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a Meal</Text>

      <TextInput
        style={styles.input}
        placeholder="Search for food..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
      />

      <FlatList
        data={searchResults}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.foodItem} onPress={() => handleSelectFood(item)}>
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.foodCalories}>{item.calories} kcal</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Meal Time</Text>

            <TouchableOpacity onPress={() => handleMealTimeSelection('breakfast')}>
              <Text style={styles.modalOption}>Breakfast</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleMealTimeSelection('lunch')}>
              <Text style={styles.modalOption}>Lunch</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleMealTimeSelection('dinner')}>
              <Text style={styles.modalOption}>Dinner</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 20 },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 10,
  },
  foodName: { fontSize: 16 },
  foodCalories: { fontSize: 16, fontWeight: 'bold' },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  modalOption: { fontSize: 18, marginVertical: 10 },
  modalCancel: { marginTop: 20, color: 'red' },
});

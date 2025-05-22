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
  const [enteredGrams, setEnteredGrams] = useState('100');

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://192.168.1.101:5000/search-foods?query=${searchQuery}`);
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
  if (!selectedFood || !enteredGrams) return;

  try {
    const response = await fetch('http://192.168.1.101:5000/food-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ food_name: selectedFood.name }),
    });

    if (!response.ok) throw new Error('Sunucu hatası');
    const data = await response.json();

    const scaleFactor = parseFloat(enteredGrams) / 100;

    const adjustedData = {
      meal_name: selectedFood.name,
      calories: data.calories * scaleFactor,
      protein: data.protein * scaleFactor,
      fat: data.fat * scaleFactor,
      carbs: data.carbs * scaleFactor,
      meal_time: mealTime,
      user_id: "test_user", // oturumdan alınacaksa güncellenecek
    };

    await saveMealToFirestore(adjustedData);

    alert(
      `${selectedFood.name} (${mealTime})\nKalori: ${adjustedData.calories.toFixed(2)} kcal\nProtein: ${adjustedData.protein.toFixed(2)}g\nYağ: ${adjustedData.fat.toFixed(2)}g\nKarbonhidrat: ${adjustedData.carbs.toFixed(2)}g`
    );

    setShowModal(false);
    setEnteredGrams('100'); // tekrar default 100 yapabiliriz
  } catch (error) {
    console.error('Besin detayları alınamadı:', error);
    alert('Besin detayları alınırken hata oluştu.');
  }
};


  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
        Besin Ara
      </Text>

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
          <View style={styles.foodItem}>
            <Text style={styles.foodName}>{item.name}</Text>
            <View style={styles.foodRight}>
              <Text style={styles.foodCalories}>{item.calories} kcal</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => handleSelectFood(item)}>
                <Text style={styles.addButtonText}>＋</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

     <Modal visible={showModal} transparent animationType="slide">
  <View style={styles.modalBackground}>
    <View style={styles.modalContainer}>

      {/* 1️⃣ Önce gramaj alanı */}
      <Text style={{ fontWeight: '500', marginBottom: 5 }}>Gramajı seçiniz:</Text>

      <TextInput
        style={styles.input}
        placeholder="Gram cinsinden miktar girin (örn: 150)"
        keyboardType="numeric"
        value={enteredGrams}
        onChangeText={setEnteredGrams}
      />

      {/* 2️⃣ Sonra öğün zaman başlığı ve seçenekler */}
      <Text style={styles.modalTitle}>Öğün zamanını seçiniz</Text>

      <TouchableOpacity onPress={() => handleMealTimeSelection('breakfast')}>
        <Text style={styles.modalOption}>Kahvaltı</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleMealTimeSelection('lunch')}>
        <Text style={styles.modalOption}>Öğlen</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleMealTimeSelection('dinner')}>
        <Text style={styles.modalOption}>Akşam</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setShowModal(false)}>
        <Text style={styles.modalCancel}>İptal</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  foodName: { fontSize: 16 },
  foodCalories: { fontSize: 16, fontWeight: 'bold' },
  foodRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    backgroundColor: '#81C784',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
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

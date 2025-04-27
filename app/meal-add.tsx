// app/meal-add.tsx

import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useState } from 'react';

export default function MealAddScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = async () => {
    // Şimdilik sahte veri — gerçek API entegrasyon sonra gelecek
    setSearchResults([
      { name: 'Egg', calories: 155 },
      { name: 'Chicken Breast', calories: 165 },
      { name: 'Rice', calories: 130 }
    ]);
  };

  const handleSelectFood = (food: any) => {
    setSelectedFood(food);
    setShowModal(true);
  };

  const handleMealTimeSelection = (mealTime: string) => {
    console.log(`Selected: ${selectedFood.name} for ${mealTime}`);
    setShowModal(false);
    // Sonraki adım: backend'e istek atılacak
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
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.foodItem} onPress={() => handleSelectFood(item)}>
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.foodCalories}>{item.calories} kcal</Text>
          </TouchableOpacity>
        )}
      />

      {/* Öğün seçme modalı */}
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

// 📦 Stil dosyası
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 20 },
  foodItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 10 },
  foodName: { fontSize: 16 },
  foodCalories: { fontSize: 16, fontWeight: 'bold' },
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  modalOption: { fontSize: 18, marginVertical: 10 },
  modalCancel: { marginTop: 20, color: 'red' }
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

// Mock data - replace with actual data from your backend
const initialCategories = [
  { id: 1, name: 'Food', budget: 500, spent: 400 },
  { id: 2, name: 'Transport', budget: 300, spent: 200 },
  { id: 3, name: 'Entertainment', budget: 400, spent: 300 },
  { id: 4, name: 'Shopping', budget: 800, spent: 300 },
  { id: 5, name: 'Bills', budget: 1000, spent: 1000 },
  { id: 6, name: 'Education', budget: 600, spent: 400 },
  { id: 7, name: 'Health', budget: 400, spent: 200 },
  { id: 8, name: 'Other', budget: 300, spent: 100 },
];

export default function Budget() {
  const { theme } = useTheme();
  const [categories, setCategories] = useState(initialCategories);
  const [totalBudget, setTotalBudget] = useState(
    categories.reduce((sum, cat) => sum + cat.budget, 0)
  );
  const [customizeModalVisible, setCustomizeModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  const handleBudgetChange = (categoryId: number, newBudget: number) => {
    const updatedCategories = categories.map((cat) =>
      cat.id === categoryId ? { ...cat, budget: newBudget } : cat
    );
    setCategories(updatedCategories);
    setTotalBudget(updatedCategories.reduce((sum, cat) => sum + cat.budget, 0));
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    setCategories([
      ...categories.slice(0, -1), // keep 'Other' last
      {
        id: Date.now(),
        name: newCategory.trim(),
        budget: 0,
        spent: 0,
      },
      categories[categories.length - 1], // 'Other'
    ]);
    setNewCategory('');
  };

  const handleDeleteCategory = (id: number) => {
    setCategories(categories.filter((cat) => cat.id !== id));
  };

  const handleEditCategory = (id: number, name: string) => {
    setEditCategoryId(id);
    setEditCategoryName(name);
  };

  const handleSaveEditCategory = () => {
    setCategories(categories.map((cat) =>
      cat.id === editCategoryId ? { ...cat, name: editCategoryName } : cat
    ));
    setEditCategoryId(null);
    setEditCategoryName('');
  };

  const handleCancelEdit = () => {
    setEditCategoryId(null);
    setEditCategoryName('');
  };

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 90) return theme.colors.error;
    if (percentage >= 75) return theme.colors.warning;
    return theme.colors.success;
  };

  const handleSaveBudget = () => {
    // Add your save logic here
    Alert.alert('Success', 'Budget updated successfully!');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Monthly Budget
        </Text>
        <Text style={[styles.totalBudget, { color: theme.colors.text }]}>
          ${totalBudget}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.customizeButton, { backgroundColor: theme.colors.secondary }]}
        onPress={() => setCustomizeModalVisible(true)}
      >
        <Ionicons name="settings-outline" size={18} color="#fff" />
        <Text style={styles.customizeButtonText}>Customize Categories</Text>
      </TouchableOpacity>
      <View style={styles.categoriesContainer}>
        {categories.map((category) => (
          <View
            key={category.id}
            style={[styles.categoryCard, { backgroundColor: theme.colors.card }]}
          >
            <View style={styles.categoryHeader}>
              <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                {category.name}
              </Text>
              <Text style={[styles.categoryAmount, { color: theme.colors.text }]}>
                ${category.budget}
              </Text>
            </View>

            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={2000}
                step={50}
                value={category.budget}
                onValueChange={(value) => handleBudgetChange(category.id, value)}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={theme.colors.primary}
              />
            </View>

            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(category.spent / category.budget) * 100}%`,
                      backgroundColor: getProgressColor(category.spent, category.budget),
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: theme.colors.text + '80' }]}>
                ${category.spent} spent
              </Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleSaveBudget}
      >
        <Text style={styles.saveButtonText}>Save Budget</Text>
      </TouchableOpacity>
      {/* Customize Categories Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={customizeModalVisible}
        onRequestClose={() => setCustomizeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Customize Categories</Text>
            {categories.slice(0, -1).map((cat) => (
              <View key={cat.id} style={styles.modalCategoryRow}>
                {editCategoryId === cat.id ? (
                  <>
                    <TextInput
                      style={[styles.input, { flex: 1, backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                      value={editCategoryName}
                      onChangeText={setEditCategoryName}
                    />
                    <TouchableOpacity onPress={handleSaveEditCategory} style={styles.modalActionButton}>
                      <Ionicons name="checkmark" size={20} color={theme.colors.success} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCancelEdit} style={styles.modalActionButton}>
                      <Ionicons name="close" size={20} color={theme.colors.error} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={[styles.modalCategoryName, { color: theme.colors.text }]}>{cat.name}</Text>
                    <TouchableOpacity onPress={() => handleEditCategory(cat.id, cat.name)} style={styles.modalActionButton}>
                      <Ionicons name="pencil" size={18} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteCategory(cat.id)} style={styles.modalActionButton}>
                      <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ))}
            {/* 'Other' category always remains and is not editable/deletable */}
            <View style={styles.modalCategoryRow}>
              <Text style={[styles.modalCategoryName, { color: theme.colors.text }]}>Other</Text>
              <Ionicons name="lock-closed-outline" size={18} color={theme.colors.text + '80'} />
            </View>
            <View style={styles.addCategoryRow}>
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                placeholder="Add new category"
                placeholderTextColor={theme.colors.text + '80'}
                value={newCategory}
                onChangeText={setNewCategory}
              />
              <TouchableOpacity onPress={handleAddCategory} style={styles.modalActionButton}>
                <Ionicons name="add" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setCustomizeModalVisible(false)}
              >
                <Text style={styles.saveButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  totalBudget: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    padding: 20,
  },
  categoryCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoryAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  sliderContainer: {
    marginBottom: 15,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  progressContainer: {
    marginTop: 5,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'right',
  },
  saveButton: {
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  customizeButton: {
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  customizeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalCategoryName: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalActionButton: {
    padding: 5,
  },
  addCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
}); 
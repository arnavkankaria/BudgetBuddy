import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Slider from '@react-native-community/slider';

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

  const handleBudgetChange = (categoryId: number, newBudget: number) => {
    const updatedCategories = categories.map((cat) =>
      cat.id === categoryId ? { ...cat, budget: newBudget } : cat
    );
    setCategories(updatedCategories);
    setTotalBudget(updatedCategories.reduce((sum, cat) => sum + cat.budget, 0));
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
}); 
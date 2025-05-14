import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../src/services/firestore';
import { Budget as BudgetType } from '../../src/types/budget';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

const categories = [
  'Food',
  'Transport',
  'Entertainment',
  'Shopping',
  'Bills',
  'Education',
  'Health',
  'Other',
];

export default function Budget() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetType | null>(null);
  const [budgets, setBudgets] = useState<BudgetType[]>([]);
  const [newBudget, setNewBudget] = useState({
    category: categories[0],
    amount: 500,
    period: 'monthly' as const,
  });

  useEffect(() => {
    if (user) {
      // Subscribe to real-time updates for budgets
      const unsubscribe = firestoreService.subscribeToBudgets(user.uid, (updatedBudgets) => {
        setBudgets(updatedBudgets);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleAddBudget = async () => {
    if (!user) return;

    try {
      await firestoreService.addBudget(user.uid, {
        ...newBudget,
        startDate: new Date(),
      });
      setModalVisible(false);
      setNewBudget({
        category: categories[0],
        amount: 500,
        period: 'monthly',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to add budget');
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!user) return;

    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestoreService.deleteBudget(user.uid, budgetId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete budget');
            }
          },
        },
      ],
    );
  };

  const handleEditBudget = async () => {
    if (!user || !editingBudget) return;

    try {
      await firestoreService.updateBudget(user.uid, editingBudget.id, {
        category: newBudget.category,
        amount: newBudget.amount,
        period: newBudget.period,
      });
      setModalVisible(false);
      setEditMode(false);
      setEditingBudget(null);
      setNewBudget({
        category: categories[0],
        amount: 500,
        period: 'monthly',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update budget');
    }
  };

  const openEditModal = (budget: BudgetType) => {
    setEditingBudget(budget);
    setNewBudget({
      category: budget.category,
      amount: budget.amount,
      period: budget.period,
    });
    setEditMode(true);
    setModalVisible(true);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Budgets</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {budgets.map((budget) => (
        <View key={budget.id} style={[styles.budgetCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.budgetHeader}>
            <Text style={[styles.budgetCategory, { color: theme.colors.text }]}>
              {budget.category}
            </Text>
            <View style={styles.budgetActions}>
              <TouchableOpacity
                onPress={() => openEditModal(budget)}
                style={styles.editButton}
              >
                <Ionicons name="pencil-outline" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteBudget(budget.id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={[styles.budgetAmount, { color: theme.colors.text }]}>
            ${budget.amount}
          </Text>
          <Text style={[styles.budgetPeriod, { color: theme.colors.text + '80' }]}>
            {budget.period}
          </Text>
        </View>
      ))}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEditMode(false);
          setEditingBudget(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {editMode ? 'Edit Budget' : 'Add New Budget'}
            </Text>
            <Text style={[styles.label, { color: theme.colors.text }]}>Category</Text>
            <View style={[styles.pickerContainer, { backgroundColor: theme.colors.background }]}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    newBudget.category === category && { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => setNewBudget({ ...newBudget, category })}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      { color: newBudget.category === category ? '#fff' : theme.colors.text },
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.colors.text }]}>Amount</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={5000}
              step={50}
              value={newBudget.amount}
              onValueChange={(value) => setNewBudget({ ...newBudget, amount: value })}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.border}
              thumbTintColor={theme.colors.primary}
            />
            <Text style={[styles.amountText, { color: theme.colors.text }]}>
              ${newBudget.amount}
            </Text>

            <Text style={[styles.label, { color: theme.colors.text }]}>Period</Text>
            <View style={[styles.pickerContainer, { backgroundColor: theme.colors.background }]}>
              {['daily', 'weekly', 'monthly', 'yearly'].map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    newBudget.period === period && { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => setNewBudget({ ...newBudget, period: period as any })}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      { color: newBudget.period === period ? '#fff' : theme.colors.text },
                    ]}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.error }]}
                onPress={() => {
                  setModalVisible(false);
                  setEditMode(false);
                  setEditingBudget(null);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={editMode ? handleEditBudget : handleAddBudget}
              >
                <Text style={styles.modalButtonText}>{editMode ? 'Update' : 'Add'}</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetCard: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  budgetCategory: {
    fontSize: 20,
    fontWeight: '600',
  },
  budgetActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 5,
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
  budgetAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  budgetPeriod: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 5,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 10,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  periodButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 5,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 
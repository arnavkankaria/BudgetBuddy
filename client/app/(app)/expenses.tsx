import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Mock data - replace with actual data from your backend
const mockExpenses = [
  { id: 1, name: 'Grocery Shopping', amount: 150, category: 'Food', date: '2024-03-15' },
  { id: 2, name: 'Movie Night', amount: 80, category: 'Entertainment', date: '2024-03-14' },
  { id: 3, name: 'Uber Ride', amount: 25, category: 'Transport', date: '2024-03-13' },
  { id: 4, name: 'Coffee Shop', amount: 15, category: 'Food', date: '2024-03-12' },
  { id: 5, name: 'New Shoes', amount: 120, category: 'Shopping', date: '2024-03-11' },
];

const mockRecurring = [
  { id: 1, name: 'Netflix', amount: 15, category: 'Entertainment', recurrence: 'monthly', nextDate: '2024-06-15' },
  { id: 2, name: 'Gym Membership', amount: 40, category: 'Health', recurrence: 'monthly', nextDate: '2024-06-20' },
];

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

export default function Expenses() {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [recurringModalVisible, setRecurringModalVisible] = useState(false);
  const [expenses, setExpenses] = useState(mockExpenses);
  const [recurringPayments, setRecurringPayments] = useState(mockRecurring);
  const [activeTab, setActiveTab] = useState<'expenses' | 'subscriptions'>('expenses');
  const [newExpense, setNewExpense] = useState({
    name: '',
    amount: '',
    category: categories[0],
    date: new Date().toISOString().split('T')[0],
  });
  const [recurring, setRecurring] = useState({
    name: '',
    amount: '',
    category: categories[0],
    recurrence: 'weekly',
    customDate: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddExpense = () => {
    if (!newExpense.name || !newExpense.amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const expense = {
      id: expenses.length + 1,
      ...newExpense,
      amount: parseFloat(newExpense.amount),
    };

    setExpenses([expense, ...expenses]);
    setNewExpense({
      name: '',
      amount: '',
      category: categories[0],
      date: new Date().toISOString().split('T')[0],
    });
    setModalVisible(false);
  };

  const handleDeleteExpense = (id: number) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setExpenses(expenses.filter((expense) => expense.id !== id));
          },
        },
      ]
    );
  };

  const handleAddRecurring = () => {
    // Add the new recurring payment to the list (mock, ready for backend)
    setRecurringPayments([
      {
        id: recurringPayments.length + 1,
        name: recurring.name,
        amount: parseFloat(recurring.amount),
        category: recurring.category,
        recurrence: recurring.recurrence,
        nextDate:
          recurring.recurrence === 'custom'
            ? recurring.customDate.toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
      },
      ...recurringPayments,
    ]);
    setRecurring({
      name: '',
      amount: '',
      category: categories[0],
      recurrence: 'weekly',
      customDate: new Date(),
    });
    setRecurringModalVisible(false);
  };

  const handleDeleteRecurring = (id: number) => {
    setRecurringPayments(recurringPayments.filter((rec) => rec.id !== id));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'expenses' && { backgroundColor: theme.colors.primary }]}
          onPress={() => setActiveTab('expenses')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'expenses' ? '#fff' : theme.colors.text }]}>Expenses</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'subscriptions' && { backgroundColor: theme.colors.primary }]}
          onPress={() => setActiveTab('subscriptions')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'subscriptions' ? '#fff' : theme.colors.text }]}>Subscriptions</Text>
        </TouchableOpacity>
      </View>
      {/* Tab Content */}
      {activeTab === 'expenses' ? (
        <ScrollView style={styles.expensesList}>
          {expenses.map((expense) => (
            <View
              key={expense.id}
              style={[styles.expenseItem, { backgroundColor: theme.colors.card }]}
            >
              <View style={styles.expenseInfo}>
                <Text style={[styles.expenseName, { color: theme.colors.text }]}>
                  {expense.name}
                </Text>
                <Text style={[styles.expenseCategory, { color: theme.colors.text + '80' }]}>
                  {expense.category} • {expense.date}
                </Text>
              </View>
              <View style={styles.expenseActions}>
                <Text style={[styles.expenseAmount, { color: theme.colors.error }]}>
                  -${expense.amount}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDeleteExpense(expense.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView style={styles.expensesList}>
          {recurringPayments.map((rec) => (
            <View key={rec.id} style={[styles.expenseItem, { backgroundColor: theme.colors.card }]}> 
              <View style={styles.expenseInfo}>
                <Text style={[styles.expenseName, { color: theme.colors.text }]}>
                  {rec.name}
                </Text>
                <Text style={[styles.expenseCategory, { color: theme.colors.text + '80' }]}>
                  {rec.category} • {rec.recurrence.charAt(0).toUpperCase() + rec.recurrence.slice(1)} • Next: {rec.nextDate}
                </Text>
              </View>
              <View style={styles.expenseActions}>
                <Text style={[styles.expenseAmount, { color: theme.colors.primary }]}>
                  -${rec.amount}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDeleteRecurring(rec.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      {/* Add buttons only in their respective tabs */}
      {activeTab === 'expenses' && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
      {activeTab === 'subscriptions' && (
        <TouchableOpacity
          style={[styles.addRecurringButton, { backgroundColor: theme.colors.secondary }]}
          onPress={() => setRecurringModalVisible(true)}
        >
          <Ionicons name="repeat" size={20} color="#fff" />
          <Text style={styles.addRecurringButtonText}>Add Recurring Payment</Text>
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Add New Expense
            </Text>

            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Expense Name"
              placeholderTextColor={theme.colors.text + '80'}
              value={newExpense.name}
              onChangeText={(text) => setNewExpense({ ...newExpense, name: text })}
            />

            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Amount"
              placeholderTextColor={theme.colors.text + '80'}
              value={newExpense.amount}
              onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
              keyboardType="decimal-pad"
            />

            <View style={styles.categoryContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor:
                          newExpense.category === category
                            ? theme.colors.primary
                            : theme.colors.background,
                      },
                    ]}
                    onPress={() => setNewExpense({ ...newExpense, category })}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        {
                          color:
                            newExpense.category === category
                              ? 'white'
                              : theme.colors.text,
                        },
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.error }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleAddExpense}
              >
                <Text style={styles.modalButtonText}>Add Expense</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={recurringModalVisible}
        onRequestClose={() => setRecurringModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add Recurring Payment</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="Payment Name"
              placeholderTextColor={theme.colors.text + '80'}
              value={recurring.name}
              onChangeText={(text) => setRecurring({ ...recurring, name: text })}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="Amount"
              placeholderTextColor={theme.colors.text + '80'}
              value={recurring.amount}
              onChangeText={(text) => setRecurring({ ...recurring, amount: text })}
              keyboardType="decimal-pad"
            />
            <View style={styles.categoryContainer}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryButton, { backgroundColor: recurring.category === cat ? theme.colors.primary : theme.colors.card, borderColor: theme.colors.primary }]}
                    onPress={() => setRecurring({ ...recurring, category: cat })}
                  >
                    <Text style={[styles.categoryButtonText, { color: recurring.category === cat ? '#fff' : theme.colors.text }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <Text style={styles.label}>Recurrence</Text>
            <View style={{ flexDirection: 'row', marginBottom: 15 }}>
              {['weekly', 'monthly', 'custom'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.categoryButton, { backgroundColor: recurring.recurrence === type ? theme.colors.primary : theme.colors.card, borderColor: theme.colors.primary }]}
                  onPress={() => setRecurring({ ...recurring, recurrence: type })}
                >
                  <Text style={[styles.categoryButtonText, { color: recurring.recurrence === type ? '#fff' : theme.colors.text }]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {recurring.recurrence === 'custom' && (
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.input, { justifyContent: 'center', alignItems: 'center' }]}> 
                <Text style={{ color: theme.colors.text }}>
                  {recurring.customDate.toDateString()}
                </Text>
              </TouchableOpacity>
            )}
            {showDatePicker && (
              <DateTimePicker
                value={recurring.customDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setRecurring({ ...recurring, customDate: date });
                }}
              />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.categoryButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setRecurringModalVisible(false)}
              >
                <Text style={[styles.categoryButtonText, { color: '#fff' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.categoryButton, { backgroundColor: theme.colors.success }]}
                onPress={handleAddRecurring}
              >
                <Text style={[styles.categoryButtonText, { color: '#fff' }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  expensesList: {
    flex: 1,
    padding: 20,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 14,
  },
  expenseActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    fontSize: 16,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryButtonText: {
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
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  addRecurringButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addRecurringButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'center',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
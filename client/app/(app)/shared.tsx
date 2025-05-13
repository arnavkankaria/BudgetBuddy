import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  date: Date;
}

interface Group {
  id: string;
  name: string;
  members: string[];
  expenses: Expense[];
}

// Mock data
const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Roommates',
    members: ['John', 'Alice', 'Bob'],
    expenses: [
      {
        id: '1',
        description: 'Rent',
        amount: 1500,
        paidBy: 'John',
        splitBetween: ['John', 'Alice', 'Bob'],
        date: new Date('2024-03-01'),
      },
      {
        id: '2',
        description: 'Utilities',
        amount: 200,
        paidBy: 'Alice',
        splitBetween: ['John', 'Alice', 'Bob'],
        date: new Date('2024-03-05'),
      },
    ],
  },
  {
    id: '2',
    name: 'Trip to NYC',
    members: ['John', 'Alice', 'Bob', 'Carol'],
    expenses: [
      {
        id: '3',
        description: 'Hotel',
        amount: 800,
        paidBy: 'Bob',
        splitBetween: ['John', 'Alice', 'Bob', 'Carol'],
        date: new Date('2024-03-10'),
      },
    ],
  },
];

export default function Shared() {
  const { theme } = useTheme();
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: '',
  });

  const handleAddExpense = () => {
    if (!selectedGroup) return;

    if (!newExpense.description || !newExpense.amount || !newExpense.paidBy) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      paidBy: newExpense.paidBy,
      splitBetween: selectedGroup.members,
      date: new Date(),
    };

    const updatedGroups = groups.map(group =>
      group.id === selectedGroup.id
        ? { ...group, expenses: [...group.expenses, expense] }
        : group
    );

    setGroups(updatedGroups);
    setShowAddExpenseModal(false);
    setNewExpense({ description: '', amount: '', paidBy: '' });
  };

  const calculateBalances = (group: Group) => {
    const balances: { [key: string]: number } = {};
    group.members.forEach(member => {
      balances[member] = 0;
    });

    group.expenses.forEach(expense => {
      const shareAmount = expense.amount / expense.splitBetween.length;
      balances[expense.paidBy] += expense.amount;
      expense.splitBetween.forEach(member => {
        balances[member] -= shareAmount;
      });
    });

    return balances;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.groupsList}>
        {groups.map(group => (
          <TouchableOpacity
            key={group.id}
            style={[styles.groupCard, { backgroundColor: theme.colors.card }]}
            onPress={() => setSelectedGroup(group)}
          >
            <Text style={[styles.groupName, { color: theme.colors.text }]}>
              {group.name}
            </Text>
            <Text style={[styles.memberCount, { color: theme.colors.text + '80' }]}>
              {group.members.length} members
            </Text>
            <Text style={[styles.expenseCount, { color: theme.colors.text + '80' }]}>
              {group.expenses.length} expenses
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={showAddExpenseModal}
        animationType="slide"
        transparent={true}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background + '99' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Add Expense
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }]}
              placeholder="Description"
              placeholderTextColor={theme.colors.text + '80'}
              value={newExpense.description}
              onChangeText={text => setNewExpense({ ...newExpense, description: text })}
            />
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }]}
              placeholder="Amount"
              placeholderTextColor={theme.colors.text + '80'}
              keyboardType="numeric"
              value={newExpense.amount}
              onChangeText={text => setNewExpense({ ...newExpense, amount: text })}
            />
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }]}
              placeholder="Paid by"
              placeholderTextColor={theme.colors.text + '80'}
              value={newExpense.paidBy}
              onChangeText={text => setNewExpense({ ...newExpense, paidBy: text })}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.error }]}
                onPress={() => setShowAddExpenseModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleAddExpense}
              >
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {selectedGroup && (
        <View style={[styles.groupDetails, { backgroundColor: theme.colors.card }]}>
          <View style={styles.groupHeader}>
            <Text style={[styles.groupTitle, { color: theme.colors.text }]}>
              {selectedGroup.name}
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowAddExpenseModal(true)}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.expensesList}>
            {selectedGroup.expenses.map(expense => (
              <View key={expense.id} style={styles.expenseItem}>
                <View style={styles.expenseInfo}>
                  <Text style={[styles.expenseDescription, { color: theme.colors.text }]}>
                    {expense.description}
                  </Text>
                  <Text style={[styles.expenseDate, { color: theme.colors.text + '80' }]}>
                    {expense.date.toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.expenseAmount}>
                  <Text style={[styles.amount, { color: theme.colors.text }]}>
                    ${expense.amount.toFixed(2)}
                  </Text>
                  <Text style={[styles.paidBy, { color: theme.colors.text + '80' }]}>
                    Paid by {expense.paidBy}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.balancesContainer}>
            <Text style={[styles.balancesTitle, { color: theme.colors.text }]}>
              Balances
            </Text>
            {Object.entries(calculateBalances(selectedGroup)).map(([member, balance]) => (
              <View key={member} style={styles.balanceItem}>
                <Text style={[styles.memberName, { color: theme.colors.text }]}>
                  {member}
                </Text>
                <Text
                  style={[
                    styles.balance,
                    { color: balance > 0 ? theme.colors.success : theme.colors.error },
                  ]}
                >
                  {balance > 0 ? '+' : ''}${balance.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  groupsList: {
    flex: 1,
    padding: 20,
  },
  groupCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  memberCount: {
    fontSize: 14,
  },
  expenseCount: {
    fontSize: 14,
  },
  groupDetails: {
    flex: 1,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expensesList: {
    flex: 1,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  expenseDate: {
    fontSize: 14,
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  paidBy: {
    fontSize: 14,
  },
  balancesContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  balancesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberName: {
    fontSize: 16,
  },
  balance: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 
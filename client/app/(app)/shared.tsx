import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

// Mock data - replace with actual data from your backend
const mockGroups = [
  {
    id: 1,
    name: 'Apartment',
    members: ['John', 'Sarah', 'Mike'],
    expenses: [
      { id: 1, name: 'Rent', amount: 1800, paidBy: 'John', split: [600, 600, 600] },
      { id: 2, name: 'Utilities', amount: 300, paidBy: 'Sarah', split: [100, 100, 100] },
    ],
  },
  {
    id: 2,
    name: 'Trip to NYC',
    members: ['John', 'Sarah', 'Mike', 'Emma'],
    expenses: [
      { id: 1, name: 'Hotel', amount: 800, paidBy: 'Mike', split: [200, 200, 200, 200] },
      { id: 2, name: 'Dinner', amount: 200, paidBy: 'Emma', split: [50, 50, 50, 50] },
    ],
  },
];

export default function Shared() {
  const { theme } = useTheme();
  const [groups, setGroups] = useState(mockGroups);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    members: '',
  });
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

  const handleCreateGroup = () => {
    if (!newGroup.name || !newGroup.members) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const members = newGroup.members.split(',').map((m) => m.trim());
    const group = {
      id: groups.length + 1,
      name: newGroup.name,
      members,
      expenses: [],
    };

    setGroups([...groups, group]);
    setNewGroup({ name: '', members: '' });
    setModalVisible(false);
  };

  const handleAddExpense = (groupId: number) => {
    setSelectedGroup(groupId);
    // Add your expense addition logic here
  };

  const calculateBalances = (group: typeof mockGroups[0]) => {
    const balances: { [key: string]: number } = {};
    group.members.forEach((member) => {
      balances[member] = 0;
    });

    group.expenses.forEach((expense) => {
      const splitAmount = expense.amount / expense.split.length;
      expense.split.forEach((amount, index) => {
        const member = group.members[index];
        if (expense.paidBy === member) {
          balances[member] += expense.amount - amount;
        } else {
          balances[member] -= amount;
        }
      });
    });

    return balances;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Shared Expenses
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {groups.map((group) => (
        <View
          key={group.id}
          style={[styles.groupCard, { backgroundColor: theme.colors.card }]}
        >
          <View style={styles.groupHeader}>
            <Text style={[styles.groupName, { color: theme.colors.text }]}>
              {group.name}
            </Text>
            <TouchableOpacity
              onPress={() => handleAddExpense(group.id)}
              style={styles.addExpenseButton}
            >
              <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.membersContainer}>
            {group.members.map((member, index) => (
              <View
                key={index}
                style={[styles.memberTag, { backgroundColor: theme.colors.background }]}
              >
                <Text style={[styles.memberName, { color: theme.colors.text }]}>
                  {member}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.expensesList}>
            {group.expenses.map((expense) => (
              <View key={expense.id} style={styles.expenseItem}>
                <View style={styles.expenseInfo}>
                  <Text style={[styles.expenseName, { color: theme.colors.text }]}>
                    {expense.name}
                  </Text>
                  <Text style={[styles.expensePaidBy, { color: theme.colors.text + '80' }]}>
                    Paid by {expense.paidBy}
                  </Text>
                </View>
                <Text style={[styles.expenseAmount, { color: theme.colors.text }]}>
                  ${expense.amount}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.balancesContainer}>
            <Text style={[styles.balancesTitle, { color: theme.colors.text }]}>
              Balances
            </Text>
            {Object.entries(calculateBalances(group)).map(([member, balance]) => (
              <View key={member} style={styles.balanceItem}>
                <Text style={[styles.balanceName, { color: theme.colors.text }]}>
                  {member}
                </Text>
                <Text
                  style={[
                    styles.balanceAmount,
                    {
                      color:
                        balance > 0
                          ? theme.colors.success
                          : balance < 0
                          ? theme.colors.error
                          : theme.colors.text,
                    },
                  ]}
                >
                  {balance > 0 ? '+' : ''}${balance}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Create New Group
            </Text>

            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Group Name"
              placeholderTextColor={theme.colors.text + '80'}
              value={newGroup.name}
              onChangeText={(text) => setNewGroup({ ...newGroup, name: text })}
            />

            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Members (comma-separated)"
              placeholderTextColor={theme.colors.text + '80'}
              value={newGroup.members}
              onChangeText={(text) => setNewGroup({ ...newGroup, members: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.error }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleCreateGroup}
              >
                <Text style={styles.modalButtonText}>Create Group</Text>
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
  headerTitle: {
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
  groupCard: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '600',
  },
  addExpenseButton: {
    padding: 5,
  },
  membersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  memberTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
  },
  expensesList: {
    marginBottom: 15,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  expensePaidBy: {
    fontSize: 14,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  balancesContainer: {
    marginTop: 15,
  },
  balancesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceName: {
    fontSize: 14,
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: '600',
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
}); 
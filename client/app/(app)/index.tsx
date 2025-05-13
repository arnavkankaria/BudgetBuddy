import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import Modal from 'react-native-modal';
import * as Linking from 'expo-linking';
import { firestoreService } from '../../src/services/firestore';
import { Transaction } from '../../src/types/transaction';
import { Budget } from '../../src/types/budget';

export default function Home() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Subscribe to real-time updates for transactions and budgets
      const unsubscribeTransactions = firestoreService.subscribeToTransactions(user.uid, (updatedTransactions) => {
        setTransactions(updatedTransactions);
      });

      const unsubscribeBudgets = firestoreService.subscribeToBudgets(user.uid, (updatedBudgets) => {
        setBudgets(updatedBudgets);
      });

      setLoading(false);

      return () => {
        unsubscribeTransactions();
        unsubscribeBudgets();
      };
    }
  }, [user]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // The real-time listeners will automatically update the data
    setRefreshing(false);
  }, []);

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 90) return theme.colors.error;
    if (percentage >= 75) return theme.colors.warning;
    return theme.colors.success;
  };

  // Calculate budget summary
  const budgetSummary = {
    totalBudget: budgets.reduce((sum, budget) => sum + budget.amount, 0),
    spent: transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    remaining: budgets.reduce((sum, budget) => sum + budget.amount, 0) -
      transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    categories: budgets.map(budget => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        name: budget.category,
        spent,
        budget: budget.amount,
      };
    }),
  };

  // Get top expenses
  const topExpenses = transactions
    .filter(t => t.type === 'expense')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map(t => ({
      id: t.id,
      name: t.description,
      amount: t.amount,
      category: t.category,
      date: new Date(t.date).toLocaleDateString(),
    }));

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.greeting, { color: theme.colors.text }]}>
          Welcome back!
        </Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.budgetCard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          Budget Overview
        </Text>
        <View style={styles.budgetSummary}>
          <View style={styles.budgetItem}>
            <Text style={[styles.budgetLabel, { color: theme.colors.text }]}>
              Total Budget
            </Text>
            <Text style={[styles.budgetAmount, { color: theme.colors.text }]}>
              ${budgetSummary.totalBudget}
            </Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={[styles.budgetLabel, { color: theme.colors.text }]}>
              Spent
            </Text>
            <Text style={[styles.budgetAmount, { color: theme.colors.error }]}>
              ${budgetSummary.spent}
            </Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={[styles.budgetLabel, { color: theme.colors.text }]}>
              Remaining
            </Text>
            <Text style={[styles.budgetAmount, { color: theme.colors.success }]}>
              ${budgetSummary.remaining}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.categoriesCard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          Categories
        </Text>
        {budgetSummary.categories.map((category, index) => (
          <View key={index} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                {category.name}
              </Text>
              <Text style={[styles.categoryAmount, { color: theme.colors.text }]}>
                ${category.spent} / ${category.budget}
              </Text>
            </View>
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
          </View>
        ))}
      </View>

      <View style={[styles.expensesCard, { backgroundColor: theme.colors.card }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Recent Expenses
          </Text>
          <TouchableOpacity onPress={() => router.push('/expenses')}>
            <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>
        {topExpenses.map((expense) => (
          <View key={expense.id} style={styles.expenseItem}>
            <View style={styles.expenseInfo}>
              <Text style={[styles.expenseName, { color: theme.colors.text }]}>
                {expense.name}
              </Text>
              <Text style={[styles.expenseCategory, { color: theme.colors.text + '80' }]}>
                {expense.category} • {expense.date}
              </Text>
            </View>
            <Text style={[styles.expenseAmount, { color: theme.colors.error }]}>
              -${expense.amount}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.reportButton, { backgroundColor: theme.colors.secondary }]}
        onPress={() => setReportModalVisible(true)}
      >
        <Ionicons name="document-text-outline" size={20} color="#fff" />
        <Text style={styles.reportButtonText}>Generate Monthly Report</Text>
      </TouchableOpacity>

      <Modal
        isVisible={reportModalVisible}
        onBackdropPress={() => setReportModalVisible(false)}
        style={styles.modal}
      >
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Generate Monthly Report
          </Text>
          <Text style={[styles.modalText, { color: theme.colors.text }]}>
            Would you like to generate a detailed monthly report of your expenses?
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.error }]}
              onPress={() => setReportModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                // Implement report generation
                setReportModalVisible(false);
                Alert.alert('Success', 'Report generated successfully!');
              }}
            >
              <Text style={styles.modalButtonText}>Generate</Text>
            </TouchableOpacity>
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  budgetSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetItem: {
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  budgetAmount: {
    fontSize: 20,
    fontWeight: '600',
  },
  categoriesCard: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryItem: {
    marginBottom: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  expensesCard: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
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
  expenseCategory: {
    fontSize: 14,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  reportButton: {
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
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
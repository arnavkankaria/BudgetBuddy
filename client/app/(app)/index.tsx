import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

// Mock data - replace with actual data from your backend
const mockData = {
  budgetSummary: {
    totalBudget: 2000,
    spent: 1200,
    remaining: 800,
    categories: [
      { name: 'Food', spent: 400, budget: 500 },
      { name: 'Transport', spent: 200, budget: 300 },
      { name: 'Entertainment', spent: 300, budget: 400 },
      { name: 'Shopping', spent: 300, budget: 800 },
    ],
  },
  topExpenses: [
    { id: 1, name: 'Grocery Shopping', amount: 150, category: 'Food', date: '2024-03-15' },
    { id: 2, name: 'Movie Night', amount: 80, category: 'Entertainment', date: '2024-03-14' },
    { id: 3, name: 'Uber Ride', amount: 25, category: 'Transport', date: '2024-03-13' },
  ],
};

export default function Home() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Add your refresh logic here
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 90) return theme.colors.error;
    if (percentage >= 75) return theme.colors.warning;
    return theme.colors.success;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: theme.colors.text }]}>
          Hello, {user?.email?.split('@')[0] || 'User'}!
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.budgetCard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          Monthly Budget
        </Text>
        <View style={styles.budgetSummary}>
          <View style={styles.budgetItem}>
            <Text style={[styles.budgetLabel, { color: theme.colors.text + '80' }]}>
              Total Budget
            </Text>
            <Text style={[styles.budgetAmount, { color: theme.colors.text }]}>
              ${mockData.budgetSummary.totalBudget}
            </Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={[styles.budgetLabel, { color: theme.colors.text + '80' }]}>
              Spent
            </Text>
            <Text style={[styles.budgetAmount, { color: theme.colors.error }]}>
              ${mockData.budgetSummary.spent}
            </Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={[styles.budgetLabel, { color: theme.colors.text + '80' }]}>
              Remaining
            </Text>
            <Text style={[styles.budgetAmount, { color: theme.colors.success }]}>
              ${mockData.budgetSummary.remaining}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.categoriesCard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          Categories
        </Text>
        {mockData.budgetSummary.categories.map((category, index) => (
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
        {mockData.topExpenses.map((expense) => (
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
}); 
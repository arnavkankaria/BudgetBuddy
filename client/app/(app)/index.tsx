import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import Modal from 'react-native-modal';
import * as Linking from 'expo-linking';

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

const BACKEND_URL = 'http://localhost:5000'; // Change to your backend URL if needed

export default function Home() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);
  const [reportModalVisible, setReportModalVisible] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState('');
  const [loadingReport, setLoadingReport] = React.useState(false);

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

  // Helper to get months up to last month
  const getMonthOptions = () => {
    const now = new Date();
    const months = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      if (i === 0) continue; // skip current month
      months.push({
        value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
      });
    }
    return months;
  };

  const handleGenerateReport = async () => {
    if (!selectedMonth) return;
    setLoadingReport(true);
    try {
      // You may need to add authentication headers if your backend requires it
      const response = await fetch(`${BACKEND_URL}/report/monthly/pdf?month=${selectedMonth}`, {
        method: 'GET',
        headers: {
          // 'Authorization': 'Bearer ...',
        },
      });
      if (!response.ok) throw new Error('Failed to generate report');
      // If backend returns a file URL
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      Linking.openURL(url);
      // If backend returns a direct URL, use:
      // const { url } = await response.json();
      // Linking.openURL(url);
    } catch (err) {
      Alert.alert('Error', 'Could not generate report.');
    } finally {
      setLoadingReport(false);
      setReportModalVisible(false);
    }
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
      {/* Generate Monthly Report Button */}
      <TouchableOpacity
        style={[styles.reportButton, { backgroundColor: theme.colors.secondary }]}
        onPress={() => setReportModalVisible(true)}
      >
        <Ionicons name="document-text-outline" size={20} color="#fff" />
        <Text style={styles.reportButtonText}>Generate Monthly Report</Text>
      </TouchableOpacity>
      {/* Report Modal */}
      <Modal isVisible={reportModalVisible} onBackdropPress={() => setReportModalVisible(false)}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}> 
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Month</Text>
          {getMonthOptions().map((month) => (
            <TouchableOpacity
              key={month.value}
              style={[styles.monthOption, selectedMonth === month.value && { backgroundColor: theme.colors.primary }]}
              onPress={() => setSelectedMonth(month.value)}
            >
              <Text style={{ color: selectedMonth === month.value ? '#fff' : theme.colors.text }}>{month.label}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setReportModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.success }]}
              onPress={handleGenerateReport}
              disabled={!selectedMonth || loadingReport}
            >
              <Text style={styles.modalButtonText}>{loadingReport ? 'Generating...' : 'Generate'}</Text>
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
  monthOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: 200,
    alignItems: 'center',
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
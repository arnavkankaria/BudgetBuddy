import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../src/services/firestore';
import { Transaction } from '../../src/types/transaction';

const screenWidth = Dimensions.get('window').width - 40;

interface CategorySpending {
  category: string;
  amount: number;
}

interface MonthlySpending {
  month: string;
  amount: number;
}

interface Insights {
  [key: string]: string;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Analytics() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [monthlySpending, setMonthlySpending] = useState<MonthlySpending[]>([]);
  const [insights, setInsights] = useState<Insights>({});

  useEffect(() => {
    if (user) {
      const unsubscribe = firestoreService.subscribeToTransactions(user.uid, (updatedTransactions) => {
        setTransactions(updatedTransactions);
        calculateAnalytics(updatedTransactions);
      });

      return () => unsubscribe();
    }
  }, [user, timeRange]);

  const calculateAnalytics = (transactions: Transaction[]) => {
    // Filter transactions based on time range
    const now = new Date();
    let startDate: Date;
    switch (timeRange) {
      case 'week':
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0);
    }

    const filteredTransactions = transactions.filter(t => {
      const transactionDate = t.date && typeof t.date.toDate === 'function' ? t.date.toDate() : new Date(t.date);
      return transactionDate >= startDate;
    });

    // Calculate category spending
    const categoryMap = new Map<string, number>();
    filteredTransactions.forEach(t => {
      if (t.type === 'expense') {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      }
    });

    if (categoryMap.size === 0) {
      categoryMap.set('No Expenses', 0);
    }

    const categorySpendingArray = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount: Math.max(0, amount),
      }))
      .sort((a, b) => b.amount - a.amount);

    setCategorySpending(categorySpendingArray);

    // Calculate monthly spending
    const monthlyMap = new Map<string, number>();
    months.forEach(month => {
      monthlyMap.set(month, 0);
    });

    filteredTransactions.forEach(t => {
      if (t.type === 'expense') {
        const transactionDate = t.date && typeof t.date.toDate === 'function' ? t.date.toDate() : new Date(t.date);
        const month = transactionDate.toLocaleString('default', { month: 'short' });
        const current = monthlyMap.get(month) || 0;
        monthlyMap.set(month, current + t.amount);
      }
    });

    const monthlySpendingArray = months
      .map(month => ({
        month,
        amount: monthlyMap.get(month) || 0,
      }));

    setMonthlySpending(monthlySpendingArray);

    // Calculate insights
    const insights: Insights = {};
    categorySpendingArray.forEach(({ category, amount }) => {
      const previousPeriodAmount = calculatePreviousPeriodAmount(transactions, category, timeRange);
      if (previousPeriodAmount > 0) {
        const percentageChange = ((amount - previousPeriodAmount) / previousPeriodAmount) * 100;
        if (percentageChange > 20) {
          insights[category] = `${Math.round(percentageChange)}% higher than last period`;
        } else if (percentageChange < -20) {
          insights[category] = `${Math.round(Math.abs(percentageChange))}% lower than last period`;
        } else {
          insights[category] = 'On track with previous period';
        }
      } else {
        insights[category] = amount > 0 ? 'New category' : 'No expenses yet';
      }
    });

    setInsights(insights);
    setLoading(false);
  };

  const calculatePreviousPeriodAmount = (
    transactions: Transaction[],
    category: string,
    timeRange: string
  ): number => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (timeRange) {
      case 'week':
        endDate = new Date();
        endDate.setDate(now.getDate() - 7);
        startDate = new Date();
        startDate.setDate(now.getDate() - 14);
        break;
      case 'month':
        endDate = new Date();
        endDate.setMonth(now.getMonth() - 1);
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 2);
        break;
      case 'year':
        endDate = new Date();
        endDate.setFullYear(now.getFullYear() - 1);
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 2);
        break;
      default:
        return 0;
    }

    return transactions
      .filter(t =>
        t.type === 'expense' &&
        t.category === category &&
        ((t.date && typeof t.date.toDate === 'function' ? t.date.toDate() : new Date(t.date)) >= startDate) &&
        ((t.date && typeof t.date.toDate === 'function' ? t.date.toDate() : new Date(t.date)) < endDate)
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: theme.colors.background,
    backgroundGradientTo: theme.colors.background,
    color: (opacity = 1) => theme.colors.primary,
    strokeWidth: 3,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    formatYLabel: (value: string) => `$${parseInt(value)}`,
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
    propsForBackgroundLines: {
      stroke: theme.colors.border,
      strokeDasharray: '4',
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: 'bold',
    },
  };

  // Helper to check if there is any real data
  const hasCategoryData = categorySpending.some(c => c.amount > 0);
  const filteredMonthlySpending = monthlySpending.filter(m => m.amount > 0);
  const hasMonthlyData = filteredMonthlySpending.length > 0;

  // Only show the last 6 months with data for the monthly chart
  const last6Months = filteredMonthlySpending.slice(-6);
  const monthlyData = {
    labels: last6Months.map(m => m.month),
    datasets: [
      {
        data: last6Months.map(m => m.amount),
        color: (opacity = 1) => theme.colors.primary, // Line color
        strokeWidth: 3,
      },
    ],
    legend: ['Spending'],
  };

  const categoryData = {
    labels: categorySpending.filter(c => c.amount > 0).map(c => c.category),
    datasets: [
      {
        data: categorySpending.filter(c => c.amount > 0).map(c => c.amount),
        color: (opacity = 1) => theme.colors.secondary, // Bar color
      },
    ],
    legend: ['Spending'],
  };

  // Dynamic chart titles
  const chartTitle = () => {
    switch (timeRange) {
      case 'week':
        return 'Weekly Spending';
      case 'month':
        return 'Monthly Spending';
      case 'year':
        return 'Yearly Spending';
      default:
        return 'Spending';
    }
  };

  // Chart width for scrollable charts
  const getChartWidth = (numPoints: number) => Math.max(screenWidth, numPoints * 60);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.timeRangeContainer}>
        {['week', 'month', 'year'].map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setTimeRange(range as 'week' | 'month' | 'year')}
          >
            <Text
              style={[
                styles.timeRangeText,
                { color: timeRange === range ? '#fff' : theme.colors.text },
              ]}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.chartContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, shadowColor: theme.colors.border, shadowOpacity: 0.15 }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          {chartTitle()} by Category
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {hasCategoryData ? (
            <View style={{ position: 'relative' }}>
              <BarChart
                data={categoryData}
                width={getChartWidth(categoryData.labels.length)}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                yAxisInterval={1}
                chartConfig={{
                  ...chartConfig,
                  backgroundGradientFrom: "#f7f7fa",
                  backgroundGradientTo: "#f7f7fa",
                  color: (opacity = 1) => "rgba(52, 120, 246, 1)",
                  labelColor: (opacity = 1) => "#222",
                  propsForBackgroundLines: {
                    stroke: "#e3e3e3",
                    strokeDasharray: "4",
                  },
                  propsForLabels: {
                    fontSize: 13,
                    fontWeight: "600",
                  },
                }}
                fromZero
                showBarTops={true}
                showValuesOnTopOfBars={true}
                withInnerLines={true}
                style={{ minWidth: screenWidth, borderRadius: 16 }}
              />
            </View>
          ) : (
            <View style={{ width: screenWidth }}>
              <Text style={{ textAlign: 'center', color: theme.colors.text + '80', marginTop: 40, marginBottom: 40 }}>
                No category spending data to display.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={[styles.chartContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, shadowColor: theme.colors.border, shadowOpacity: 0.15 }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          {chartTitle()}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {hasMonthlyData ? (
            <LineChart
              data={monthlyData}
              width={getChartWidth(monthlyData.labels.length)}
              height={220}
              yAxisLabel="$"
              yAxisSuffix=""
              chartConfig={chartConfig}
              bezier
              style={{ minWidth: screenWidth, borderRadius: 16 }}
            />
          ) : (
            <View style={{ width: screenWidth }}>
              <Text style={{ textAlign: 'center', color: theme.colors.text + '80', marginTop: 40, marginBottom: 40 }}>
                No {chartTitle().toLowerCase()} data to display.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={[styles.insightsContainer, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.insightsTitle, { color: theme.colors.text }]}>Spending Insights</Text>
        {Object.entries(insights).length > 0 ? (
          Object.entries(insights).map(([category, insight]) => (
            <View key={category} style={styles.insightItem}>
              <Text style={[styles.insightCategory, { color: theme.colors.text }]}>{category}</Text>
              <Text style={[styles.insightText, { color: theme.colors.text + '80' }]}>{insight}</Text>
            </View>
          ))
        ) : (
          <Text style={{ textAlign: 'center', color: theme.colors.text + '80', marginTop: 20 }}>
            No insights to display yet.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  timeRangeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: '#fff',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  insightsContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  insightItem: {
    marginBottom: 15,
  },
  insightCategory: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  insightText: {
    fontSize: 14,
  },
});
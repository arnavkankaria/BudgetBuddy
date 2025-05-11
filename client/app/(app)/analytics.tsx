import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width - 40; // Account for padding

interface CategorySpending {
  category: string;
  amount: number;
}

interface MonthlySpending {
  month: string;
  amount: number;
}

interface Insights {
  [category: string]: string;
}

// Dummy data for testing
const dummyCategorySpending: CategorySpending[] = [
  { category: 'Food', amount: 450 },
  { category: 'Transport', amount: 200 },
  { category: 'Entertainment', amount: 300 },
  { category: 'Shopping', amount: 250 },
  { category: 'Bills', amount: 800 },
  { category: 'Education', amount: 400 },
];

const dummyMonthlySpending: MonthlySpending[] = [
  { month: 'Jan', amount: 1200 },
  { month: 'Feb', amount: 1500 },
  { month: 'Mar', amount: 1800 },
  { month: 'Apr', amount: 1400 },
  { month: 'May', amount: 1600 },
  { month: 'Jun', amount: 1900 },
];

const dummyInsights: Insights = {
  'Food': '20% higher than last month',
  'Transport': '15% lower than average',
  'Entertainment': 'On track with budget',
  'Shopping': '10% over budget',
  'Bills': 'Consistent with previous months',
};

export default function Analytics() {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>(dummyCategorySpending);
  const [monthlySpending, setMonthlySpending] = useState<MonthlySpending[]>(dummyMonthlySpending);
  const [insights, setInsights] = useState<Insights>(dummyInsights);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeRange]);

  const chartConfig = {
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    color: (opacity = 1) => theme.colors.primary,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => theme.colors.text,
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
  };

  // Calculate the width for the chart to fit inside the card
  const CARD_MARGIN = 20 * 2; // left + right
  const CARD_PADDING = 20 * 2; // left + right
  const chartWidth = Dimensions.get('window').width - CARD_MARGIN - CARD_PADDING;

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
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Spending Analytics
        </Text>
        <View style={styles.timeRangeContainer}>
          {['week', 'month', 'year'].map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                {
                  backgroundColor:
                    timeRange === range ? theme.colors.primary : theme.colors.background,
                },
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  {
                    color: timeRange === range ? 'white' : theme.colors.text,
                  },
                ]}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.chartCard, { backgroundColor: theme.colors.card, overflow: 'hidden' }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          Monthly Spending Trend
        </Text>
        <LineChart
          data={{
            labels: monthlySpending.map(item => item.month),
            datasets: [{
              data: monthlySpending.map(item => item.amount),
            }],
          }}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={[styles.chartCard, { backgroundColor: theme.colors.card, overflow: 'hidden' }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          Spending by Category
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={{
              labels: categorySpending.map(item => item.category),
              datasets: [{
                data: categorySpending.map(item => item.amount),
              }],
            }}
            width={Math.max(chartWidth, categorySpending.length * 80)}
            height={260}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </ScrollView>
      </View>

      <View style={[styles.insightsCard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.insightsTitle, { color: theme.colors.text }]}>
          Spending Insights
        </Text>
        {Object.entries(insights).map(([category, insight], index) => (
          <View key={index} style={styles.insightItem}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={theme.colors.primary}
              style={styles.insightIcon}
            />
            <Text style={[styles.insightText, { color: theme.colors.text }]}>
              {category}: {insight}
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
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeRangeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartCard: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  insightsCard: {
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  insightIcon: {
    marginRight: 10,
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
}); 
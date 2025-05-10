import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import {
  VictoryPie,
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
  VictoryLabel,
} from 'victory-native';

// Mock data - replace with actual data from your backend
const mockData = {
  categorySpending: [
    { x: 'Food', y: 400 },
    { x: 'Transport', y: 200 },
    { x: 'Entertainment', y: 300 },
    { x: 'Shopping', y: 300 },
    { x: 'Bills', y: 1000 },
    { x: 'Education', y: 400 },
    { x: 'Health', y: 200 },
    { x: 'Other', y: 100 },
  ],
  monthlySpending: [
    { x: 'Jan', y: 1200 },
    { x: 'Feb', y: 1500 },
    { x: 'Mar', y: 1800 },
    { x: 'Apr', y: 1400 },
    { x: 'May', y: 1600 },
    { x: 'Jun', y: 1900 },
  ],
};

const screenWidth = Dimensions.get('window').width;

export default function Analytics() {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState('month');

  const colorScale = [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.success,
    theme.colors.warning,
    theme.colors.error,
    '#FF9500',
    '#5856D6',
    '#FF2D55',
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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

      <View style={[styles.chartCard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          Spending by Category
        </Text>
        <View style={styles.pieChartContainer}>
          <VictoryPie
            standalone={true}
            data={mockData.categorySpending}
            colorScale={colorScale}
            width={screenWidth - 40}
            height={300}
            innerRadius={70}
            labelRadius={70 + 40}
            style={{ 
              labels: { fill: theme.colors.text, fontSize: 12 }
            }}
            labelComponent={
              <VictoryLabel
                style={{ fill: theme.colors.text }}
                text={({ datum }) => `${datum.x}\n$${datum.y}`}
              />
            }
          />
        </View>
      </View>

      <View style={[styles.chartCard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          Monthly Spending Trend
        </Text>
        <View style={styles.barChartContainer}>
          <VictoryChart
            standalone={true}
            width={screenWidth - 40}
            height={300}
            padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
            theme={VictoryTheme.material}
          >
            <VictoryAxis
              style={{
                axis: { stroke: theme.colors.text },
                ticks: { stroke: theme.colors.text },
                tickLabels: { fill: theme.colors.text },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: theme.colors.text },
                ticks: { stroke: theme.colors.text },
                tickLabels: { fill: theme.colors.text },
              }}
            />
            <VictoryBar
              data={mockData.monthlySpending}
              style={{
                data: {
                  fill: theme.colors.primary,
                },
              }}
            />
          </VictoryChart>
        </View>
      </View>

      <View style={[styles.insightsCard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.insightsTitle, { color: theme.colors.text }]}>
          Spending Insights
        </Text>
        <View style={styles.insightItem}>
          <Text style={[styles.insightText, { color: theme.colors.text }]}>
            • Your highest spending category is Bills (${mockData.categorySpending[4].y})
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Text style={[styles.insightText, { color: theme.colors.text }]}>
            • You've spent 20% more this month compared to last month
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Text style={[styles.insightText, { color: theme.colors.text }]}>
            • Consider reducing Entertainment expenses to stay within budget
          </Text>
        </View>
      </View>
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
  pieChartContainer: {
    alignItems: 'center',
  },
  barChartContainer: {
    alignItems: 'center',
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
    marginBottom: 10,
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
  },
}); 
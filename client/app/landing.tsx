import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

function BudgetBuddyLogo() {
  // SVG logo based on the image provided, using react-native-svg
  return (
    <View style={styles.logoContainer}>
      <Svg width={160} height={160} viewBox="0 0 160 160" fill="none">
        <Circle cx={80} cy={80} r={70} stroke="#7B5AF8" strokeWidth={6} fill="none" />
        <Path d="M60 110c-10-15-15-45 10-60 10-6 20 2 15 15-10 20-2 35 10 35 10 0 20-10 10-25-5-8-2-20 10-20 10 0 15 10 10 20-10 20-5 35 10 35" fill="#7B5AF8" fillOpacity={0.8} />
        <Circle cx={120} cy={40} r={18} fill="#B3A4F7" stroke="#7B5AF8" strokeWidth={3} />
        <Circle cx={135} cy={60} r={14} fill="#B3A4F7" stroke="#7B5AF8" strokeWidth={3} />
        <Circle cx={100} cy={90} r={18} fill="#B3A4F7" stroke="#7B5AF8" strokeWidth={3} />
        <SvgText x={110} y={47} fontSize={14} fontWeight="bold" fill="#7B5AF8">$</SvgText>
        <SvgText x={127} y={67} fontSize={12} fontWeight="bold" fill="#7B5AF8">$</SvgText>
        <SvgText x={93} y={97} fontSize={16} fontWeight="bold" fill="#7B5AF8">$</SvgText>
      </Svg>
    </View>
  );
}

export default function Landing() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <BudgetBuddyLogo />
      <Text style={styles.title}>BudgetBuddy</Text>
      <Text style={styles.tagline}>
        "Your Budget's Best Friend"
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/sign-in')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCFA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#7B5AF8',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 22,
    color: '#7B5AF8',
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#7B5AF8',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 32,
    shadowColor: '#7B5AF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
}); 
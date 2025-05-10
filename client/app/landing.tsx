import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

export default function Landing() {
  const router = useRouter();
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Image
        source={require('../assets/images/icon.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="BudgetBuddy Logo"
      />
      <Text style={[styles.title, { color: theme.colors.primary }]}>BudgetBuddy</Text>
      <Text style={[styles.tagline, { color: theme.colors.secondary }]}>
        "Your Budget's Best Friend"
      </Text>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]} onPress={() => router.push('/sign-in')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 200,
    height: 160,
    marginBottom: 32,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 22,
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '500',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 32,
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
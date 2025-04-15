import React, { useState } from "react";
import { Button, Text, View, TextInput, StyleSheet } from "react-native";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, User } from "firebase/auth";

// Firebase configuration – replace these with your actual config values
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ... include other configuration values as needed
};

// Initialize Firebase app and get the auth service
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function Index() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [user, setUser] = useState<User | null>(null); // Using the User type from firebase/auth

  const handleLogin = () => {
    // Use the modular signInWithEmailAndPassword function
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setUser(userCredential.user);
        console.log("User logged in:", userCredential.user.email);
      })
      .catch((error) => {
        console.error("Error signing in:", error);
        alert(`Login failed: ${error.message}`);
      });
  };

  return (
    <View style={styles.container}>
      {user ? (
        <Text>Welcome, {user.email}!</Text>
      ) : (
        <View style={styles.loginContainer}>
          <Text>Sign in with Firebase</Text>
          <TextInput
            style={styles.input}
            onChangeText={setEmail}
            value={email}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            placeholder="Password"
            secureTextEntry
          />
          <Button onPress={handleLogin} title="Log In" color="#841584" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loginContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    height: 40,
    width: 200,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

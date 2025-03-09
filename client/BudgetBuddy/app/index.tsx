import { Button, Text, View, TextInput, StyleSheet } from "react-native";
import React, { useState } from "react";

export default function Index() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(""); // To track login state

  const handleLogin = () => {
    if (username && password) {
      console.log("Logging in user:", username);
      setUser(username); // Simulating login
    } else {
      console.log(process.env.EXPO_PUBLIC_FIREBASE_API_KEY);
    }
  };

  return (
    <View style={styles.container}>
      {user ? (
        <Text>Welcome, {user}!</Text>
      ) : (
        <View style={styles.loginContainer}>
          <Text>Edit `app/index.tsx` to edit this screen.</Text>

          <TextInput
            style={styles.input}
            onChangeText={setUsername}
            value={username}
            placeholder="Username"
          />
          <TextInput
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            placeholder="Password"
            secureTextEntry={true} // Hides input for passwords
          />
          <Button onPress={handleLogin} title="Log In" color="#841584" />
        </View>
      )}
    </View>
  );
}

// Styles
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

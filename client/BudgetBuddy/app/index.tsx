import { Button, Text, View, TextInput, StyleSheet } from "react-native";
import React from "react";



export default function Index() {
  const [user, onChangeUser] = React.useState('');
  const [pass, onChangePass] = React.useState('');
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      

      <TextInput
        style={styles.input}
        onChangeText={onChangeUser}
        value={user}
      />
      <TextInput
        style={styles.input}
        onChangeText={onChangePass}
        value={pass}
      />
      <Button
        onPress={console.log} // Log in
        title="Log In"
        color="#841584"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
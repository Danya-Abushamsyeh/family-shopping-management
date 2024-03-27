import React, { useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import firebase from './../firebase';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const auth = firebase.auth();

  const handleSignUp = async () => {
      try {
          await auth.createUserWithEmailAndPassword(email, password);
          // If login successful, navigate to the next screen or perform desired action
          navigation.navigate('Home'); // Example: Navigate to Home screen
      } catch (error) {
          // Handle login errors
          Alert.alert('Login Error', error.message);
      }
  };

  const handleLogin = async () => {
    try {
        await auth.signInWithEmailAndPassword(email, password);
        // If login successful, navigate to the next screen or perform desired action
        navigation.navigate('Profile'); // Example: Navigate to Home screen
    } catch (error) {
        // Handle login errors
        Alert.alert('Login Error', error.message);
    }
};

  return (
    <KeyboardAvoidingView
        styles={styles.container}
        behavior='padding'
    >
      <View style={styles.inputContainer}>
      <Text style={styles.title}>התחבר למערכת</Text>

      <TextInput
        style={styles.input}
        placeholder="מייל"
        // keyboardType="email-address"
        // autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="סיסמא"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <View style={styles.buttonContainer}>
       <TouchableOpacity
         style={styles.button} 
         onPress={handleLogin}>
         <Text style={styles.buttonText}>התחברות</Text>
       </TouchableOpacity>

       <TouchableOpacity 
        style={[styles.button, styles.buttonOutline]} 
        onPress={handleSignUp}>
        <Text style={styles.buttonOutlineText}>הירשם</Text>
      </TouchableOpacity>
      </View>
    </View>
    </KeyboardAvoidingView>
  )
}

export default LoginScreen

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0', // Background color added
    },
    inputContainer: {
        // flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        },
    title: {
      color: '#635A5A',
      marginTop:100,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center', // Center text alignment
    },
    input: {
      height: 40,
      width: '100%',
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 20,
      paddingLeft: 10,
      justifyContent: 'center',
      alignItems: 'center',
      
    },
    buttonContainer: {
      marginTop: 20,
      width: '100%',
      alignItems: 'center',
    },
    button: {
      backgroundColor: '#635A5A', 
      paddingVertical: 15,
      paddingHorizontal: 30,
      width: '90%',
      alignItems: 'center',
      padding:15,
      backgroundColor:'#635A5A',
      borderRadius:99,
      marginTop:50
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    buttonOutline: {
      marginTop: 15,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#635A5A', // Specified color for the button border
    },
    buttonOutlineText: {
      color: '#635A5A', // Specified color for the button text
      fontSize: 14,
      fontWeight: 'bold',
    },
  });
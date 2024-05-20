import React, { useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import firebase from './../firebase';
import { auth, createUserDocument } from './../firebase'; 

const Signup = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const auth = firebase.auth();

  const handleLetsGetStartedPress = () => {
    navigation.navigate('Login');
  };

  const handleSignUp = async () => {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      await createUserDocument(user, { displayName }); 
      Alert.alert('ברוכים הבאים! בוא נכין רשימת הקניות של המשפחה');
      navigation.navigate('tab');
    } catch (error) {
      Alert.alert('Sign Up Error', error.message);
    }
  };

//   const handleLogin = async () => {
//     try {
//         await auth.signInWithEmailAndPassword(email, password);
//         // If login successful, navigate to the next screen or perform desired action
//         navigation.navigate('Profile'); // Example: Navigate to Home screen
//     } catch (error) {
//         Alert.alert('Login Error', error.message);
//     }
// };

  return (
    <KeyboardAvoidingView
        styles={styles.container}
        behavior='padding'
    >
      <View style={styles.inputContainer}>
      <Text style={styles.title}>הירשם למערכת</Text>

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
          placeholder="שם משתמש"
          value={displayName}
          onChangeText={setDisplayName}
      />
      <TextInput
        style={styles.input}
        placeholder="סיסמא"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <View style={styles.buttonContainer}>
       {/* <TouchableOpacity
         style={styles.button} 
         onPress={handleLogin}>
         <Text style={styles.buttonText}>התחברות</Text>
       </TouchableOpacity> */}

       <TouchableOpacity 
        style={styles.button} 
        onPress={handleSignUp}>
        <Text style={styles.buttonOutlineText}>הירשם</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem} onPress={handleLetsGetStartedPress}>
            <Text>כבר יש לך חשבון? התחברות </Text>
          </TouchableOpacity>
      </View>
    </View>
    </KeyboardAvoidingView>
  )
}

export default Signup

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0', 
    },
    inputContainer: {
        // flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        },
    title: {
      color: '#635A5A',
      marginTop:180,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center', 
    },
    input: {
      height: 40,
      width: '100%',
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 30,
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
      borderColor: '#635A5A', 
    },
    buttonOutlineText: {
      color: 'white',
      fontSize: 15,
      fontWeight: 'bold',
    },
  });
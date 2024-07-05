import React, { useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import firebase from './../firebase';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons'; 

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const auth = firebase.auth();
  const handleLsign = () => {
    navigation.navigate('signup');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות.');
      return;
    }
    setLoading(true);
    try {
        await auth.signInWithEmailAndPassword(email, password);
        navigation.navigate('tab'); 
    } catch (error) {
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
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="סיסמא"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={15} color="gray" style={styles.eye} />
          </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
       <TouchableOpacity
         style={styles.button} 
         onPress={handleLogin}
         disabled={loading}>
       {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonOutlineText}>התחברות</Text>}
       </TouchableOpacity>

       <TouchableOpacity style={styles.signupLink} onPress={handleLsign}>
            <Text style={styles.signupText}>אין לך חשבון? הירשם</Text>
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
      marginBottom: 20,
      paddingLeft: 10,
      justifyContent: 'center',
      alignItems: 'center',
      textAlign:'left'
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
      borderRadius:10,
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
      color: '#fff', 
      fontSize: 14,
      fontWeight: 'bold',
    },
    signupLink: {
      marginTop: 20,
    },
    signupText: {
      fontSize: 14,
      color: '#464444',
      textDecorationLine: 'underline',
      textAlign: 'center',
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 8,
      width: '100%',
      marginBottom: 20,
  
    },
    passwordInput: {
      flex: 1,
      height: 40,
      paddingLeft: 10,
      justifyContent: 'center',
      // alignItems: 'center',
      textAlign: 'left',  
    },
    eye:{
    right:4,
   }
  });
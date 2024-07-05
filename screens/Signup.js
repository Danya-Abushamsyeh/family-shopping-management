import React, { useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import firebase from './../firebase';
import { auth, createUserDocument } from './../firebase';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons'; 

const Signup = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLetsGetStartedPress = () => {
    navigation.navigate('Login');
  };

  const handleSignUp = async () => {
    if (!email || !password || !displayName) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await createUserDocument(user, { displayName });
      Alert.alert('ברוכים הבאים! בוא נכין רשימת הקניות של המשפחה');
      navigation.navigate('tab');
    } catch (error) {
      Alert.alert('Sign Up Error', error.message);
    } finally {
      setLoading(false);
    }
  };

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
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="שם משתמש"
          value={displayName}
          onChangeText={setDisplayName}
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
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonOutlineText}>הירשם</Text>}
          </TouchableOpacity>


          <TouchableOpacity style={styles.signupLink} onPress={handleLetsGetStartedPress}>
            <Text style={styles.signupText}>כבר יש לך חשבון? התחברות </Text>
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
    marginTop: 180,
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
    textAlign: 'left',
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
    padding: 15,
    backgroundColor: '#635A5A',
    borderRadius: 10,
    marginTop: 50
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
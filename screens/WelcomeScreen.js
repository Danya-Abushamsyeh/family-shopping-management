import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const handleLetsGetStartedPress = () => {
    navigation.navigate('Login');
  };
  const handleSignupPress = () => {
    navigation.navigate('signup');
  };

  return (
      <View style={styles.container}>
        <Image source={require('./../assets/images/log.png')} style={styles.loginImage} />
        <View style={styles.subContainer}>
          <Text style={styles.title}>הכן את רשימת הקניות שלך עם משפחתך</Text>
          <Text style={styles.subtitle}>האפליקציה הטובה ביותר לניהול הרכישות המשפחתיות שלך</Text>
          <TouchableOpacity style={styles.button} onPress={handleLetsGetStartedPress}>
            <Text style={styles.buttonText}>בואו נתחיל</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signupLink} onPress={handleSignupPress}>
            <Text style={styles.signupText}>אין לך חשבון? הירשם</Text>
          </TouchableOpacity>
        </View>
      </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#e9a1a1',
  },
  loginImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  subContainer: {
    width: '90%',
    backgroundColor: '#edb3b3',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: '#464444',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#464444',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 80,
    backgroundColor: '#635A5A',
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 17,
    color: '#ffffff',
    textAlign: 'center',
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
});

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import firebase from './../firebase';

const ProfileScreen = ({ navigation }) => {
      // Dummy user data for demonstration purposes
  const userData = {
    username: 'JohnDoe123',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
  };
  const handleSignOut = async () => {
    try {
      await firebase.auth().signOut();
      // Navigate to the login screen or perform any other action after sign out
      navigation.navigate('Welcome'); // Example: Navigate to Home screen

    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
    return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.username}>{userData.username}</Text>
            <Text style={styles.fullName}>{userData.fullName}</Text>
            <Text style={styles.email}>{userData.email}</Text>
          </View>
    
          <View style={styles.optionsContainer}>

            <TouchableOpacity style={styles.optionItem}>
              <Text style={styles.optionText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <Text style={styles.optionText}>Change Password</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity style={styles.optionItem}>
              <Text style={styles.optionText}>Privacy Settings</Text>
            </TouchableOpacity> */}

            <TouchableOpacity 
             style={styles.optionItem}
             onPress={handleSignOut}>                    
              <Text style={styles.optionText}>Log Out</Text>
            </TouchableOpacity>

          </View>
        </View>
      );
    };
    

export default ProfileScreen

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      marginTop:100,

    },
    header: {
      alignItems: 'center',
      marginBottom: 20,
    },
 
    username: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    fullName: {
      fontSize: 16,
      color: 'gray',
      marginBottom: 5,
    },
    email: {
      fontSize: 14,
      color: 'gray',
    },
    optionsContainer: {
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
      paddingTop: 20,
    },
    optionItem: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    optionText: {
      fontSize: 16,
    },
  });
  
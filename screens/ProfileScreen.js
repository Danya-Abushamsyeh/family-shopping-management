import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import firebase, { auth, firestore, getUserDocument, storage } from './../firebase';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocument = await getUserDocument(currentUser.uid);
        setUserData(userDocument);
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { userData });
  };

  const handleSignOut = async () => {
    try {
      await firebase.auth().signOut();
      navigation.navigate('Welcome');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleChooseImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access media library is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      await saveImageToStorage(result.uri);
    }
  };

  const saveImageToStorage = async (uri) => {
    try {
      console.log('Starting image upload process...');
  
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
  
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error('Failed to fetch the image from the given URI.');
      }
      const blob = await response.blob();
      console.log('Blob created from image URI:', blob);
  
      const imageRef = storage.ref().child(`profile_photos/${currentUser.uid}`);
      await imageRef.put(blob);
      console.log('Image uploaded to Firebase Storage.');
  
      const downloadURL = await imageRef.getDownloadURL();
      console.log('Download URL obtained:', downloadURL);
  
      await currentUser.updateProfile({ photoURL: downloadURL });
      console.log('User profile updated with new photo URL.');
  
      await firestore.collection('users').doc(currentUser.uid).update({ photoURL: downloadURL });
      console.log('photoURL updated in Firestore.');
  
      setUserData({ ...userData, photoURL: downloadURL });
    } catch (error) {
      console.error('Error saving image to storage:', error);
      Alert.alert('Error', 'Failed to upload the image. Please try again.');
    }
  };
  

  return (
    <View style={styles.container}>
      {/* Render loading indicator if data is still loading */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#e9a1a1" />
      ) : (
        <>
          <TouchableOpacity onPress={handleChooseImage}>
            {/* Render profile image or placeholder */}
            <View style={styles.imageContainer}>
              {userData && userData.photoURL ? (
                <Image source={{ uri: userData.photoURL }} style={styles.profileImage} />
              ) : (
                <FontAwesome name="user-circle" size={120} color="#e9a1a1" />
              )}
            </View>
          </TouchableOpacity>



          {userData && (
            <View style={styles.header}>
              <Text style={styles.username}>{userData.displayName}</Text>
              <Text style={styles.email}>{userData.email}</Text>
            </View>
          )}

          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionItem} onPress={handleEditProfile}>
              <View style={styles.buttonContainer}>
                <Text style={styles.optionText}>ערוך פרופיל</Text>
                <FontAwesome name="edit" size={20} style={styles.buttonIcon} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('ShareList')}>
              <View style={styles.buttonContainer}>
                <Text style={styles.optionText}>רשימות משותפות </Text>
                <FontAwesome name="list" size={20} style={styles.buttonIcon} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('Help')}>
              <View style={styles.buttonContainer}>
                <Text style={styles.optionText}>עזרה</Text>
                <FontAwesome name="question" size={20} style={styles.buttonIcon} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem} onPress={handleSignOut}>
              <View style={styles.buttonContainer}>
                <Text style={styles.optionText}>התנתק</Text>
                <FontAwesome name="sign-out" size={20} style={styles.buttonIcon} />
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: 20,
    marginLeft: 120
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 70,
  },
  uploadText: {
    color: '#e9a1a1',
    marginBottom: 10,
    fontSize:10
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop:20
  },
  email: {
    fontSize: 14,
    color: 'gray',
  },
  optionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 20,
    alignItems:'flex-end',
    marginBottom: 10,
  },
  optionItem: {
    paddingVertical: 15,
    borderBottomColor: '#e0e0e0',
  },
  optionText: {
    fontSize: 15, // Increased text size
    fontWeight: 'bold',
    marginLeft: 220,
    alignItems:'flex-end',
    textAlign:'right',

  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,

  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },

  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  buttonIcon: {
    marginlift:80, 
    paddingHorizontal: 10,
    color: '#e9a1a1',
  },  
});

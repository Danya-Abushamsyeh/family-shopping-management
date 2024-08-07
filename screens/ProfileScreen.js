import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator, Modal } from 'react-native';
import firebase, { auth, getUserDocument, uploadProfileImage, updateUserProfileImage, deleteUserProfileImage } from './../firebase';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const imageUrl = await uploadProfileImage(uri, currentUser.uid);
          await updateUserProfileImage(currentUser.uid, imageUrl);
          const updatedUserDocument = await getUserDocument(currentUser.uid);
          setUserData(updatedUserDocument);
        } catch (error) {
          console.error('Error updating profile image:', error);
          Alert.alert('Error', 'Failed to update profile image.');
        }
      }
    }
    setModalVisible(false);
  };

  const handleDeleteProfileImage = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await deleteUserProfileImage(currentUser.uid);
        const updatedUserDocument = await getUserDocument(currentUser.uid);
        setUserData(updatedUserDocument);
        Alert.alert('Success', 'Profile image deleted successfully.');
      } catch (error) {
        console.error('Error deleting profile image:', error);
        Alert.alert('Error', 'Failed to delete profile image.');
      }
    }
    setModalVisible(false);
  };

  const handleProfileImagePress = () => {
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#e9a1a1" />
      ) : (
        <>
          <TouchableOpacity onPress={handleProfileImagePress}>
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

            <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('AddFamilyMember')}>
              <View style={styles.buttonContainer}>
                <Text style={styles.optionText}>הוסף בן משפחה</Text>
                <FontAwesome name="users" size={20} style={styles.buttonIcon} />
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

          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {userData && userData.photoURL ? (
                  <>
                    <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
                      <Text style={styles.modalButtonText}>בחר תמונה חדשה</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalButton} onPress={handleDeleteProfileImage}>
                      <Text style={styles.modalButtonText}>מחק תמונת פרופיל</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
                    <Text style={styles.modalButtonText}>בחר תמונה חדשה</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalButtonText}>בטל</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
    marginLeft: 120,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 70,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 20,
  },
  email: {
    fontSize: 14,
    color: 'gray',
  },
  optionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 20,
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  optionItem: {
    paddingVertical: 15,
    borderBottomColor: '#e0e0e0',
  },
  optionText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 220,
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginLift: 80,
    paddingHorizontal: 10,
    color: '#e9a1a1',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalButton: {
    width: '100%',
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  modalButtonText: {
    fontSize: 16,
    color: '#635A5A',
  },
  eye: {
    right: 4,
  }
});

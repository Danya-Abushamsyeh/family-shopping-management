import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import firebase from './../firebase';
import ImagePicker from 'react-native-image-picker';

const EditProfileScreen = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null); // New state for profile photo

  const handleChangePassword = async () => {
    try {
      if (newPassword !== confirmNewPassword) {
        Alert.alert('Password Error', 'New password and confirm password do not match');
        return;
      }

      const user = firebase.auth().currentUser;
      const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(newPassword);

      Alert.alert('Password Changed', 'Your password has been changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      Alert.alert('Password Change Error', error.message);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const user = firebase.auth().currentUser;
      await user.updateProfile({
        displayName: displayName.trim(),
        email: email.trim(),
      });
    //   if (profilePhoto) {
    //     try {
    //       const user = firebase.auth().currentUser;
    //       const storageRef = firebase.storage().ref().child(`profile_photos/${user.uid}`);
    //       await storageRef.put(profilePhoto);
    //       const photoURL = await storageRef.getDownloadURL();
    //       await user.updateProfile({
    //         photoURL: photoURL,
    //       });
    //       // Reset profile photo state
    //       setProfilePhoto(null);
    //     } catch (error) {
    //       Alert.alert('Profile Photo Update Error', error.message);
    //     }
    //   }
      Alert.alert('Profile Updated', 'Your profile has been updated successfully');
      setDisplayName('');
      setEmail('');
      navigation.navigate('Profile');
    } catch (error) {
      Alert.alert('Profile Update Error', error.message);
    }
    
  };

  const handleChoosePhoto = async () => {
    // Options for image picker
    const options = {
      title: 'Select Profile Photo',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
  
    // Show image picker
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        // Set selected photo to profile photo state
        setProfilePhoto(response.uri);
      }
    });
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Current Password"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmNewPassword}
        onChangeText={setConfirmNewPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingLeft: 10,
  },
  button: {
    backgroundColor: '#635A5A',
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
    borderRadius: 99,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;

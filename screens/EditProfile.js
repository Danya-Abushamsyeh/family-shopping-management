import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import firebase from './../firebase';
import { Picker } from '@react-native-picker/picker'; // Import Picker from the new package

const EditProfileScreen = ({ navigation }) => {
  const [selectedOption, setSelectedOption] = useState('displayName');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleChangePassword = async () => {
    try {
      if (newPassword !== confirmNewPassword) {
        Alert.alert('שגיאת סיסמה', 'סיסמה חדשה וסיסמת אישור אינן תואמות');
        return;
      }

      const user = firebase.auth().currentUser;
      const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(newPassword);

      Alert.alert('הסיסמה שונתה', 'הסיסמה שלך שונתה בהצלחה');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      Alert.alert('שגיאת שינוי סיסמה', error.message);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const user = firebase.auth().currentUser;
      const updates = {};
      
      if (selectedOption === 'displayName') {
        updates.displayName = displayName.trim();
      } else if (selectedOption === 'email') {
        updates.email = email.trim();
      }
      console.log('Updates:', updates); // Log the updates being made

      await user.updateProfile(updates);

      Alert.alert('הפרופיל עודכן', 'הפרופיל שלך עודכן בהצלחה');
      setDisplayName('');
      setEmail('');
      navigation.navigate('פרופיל');
    } catch (error) {
      Alert.alert('שגיאת עדכון פרופיל', error.message);
    }
  };

  const renderFieldsBasedOnOption = () => {
    if (selectedOption === 'displayName') {
      return (
        <TextInput
          style={styles.input}
          placeholder="שם משתמש"
          value={displayName}
          onChangeText={setDisplayName}
        />
      );
    } else if (selectedOption === 'email') {
      return (
        <TextInput
          style={styles.input}
          placeholder="מייל"
          value={email}
          onChangeText={setEmail}
        />
      );
    } else {
      return (
        <>
          <TextInput
            style={styles.input}
            placeholder="סיסמה נוכחית"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="סיסמה חדשה"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="תאשר סיסמא חדשה"
            secureTextEntry
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
          />
        </>
      );
    }
  };

  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>ערוך פרופיל</Text>

      <Picker
        selectedValue={selectedOption}
        style={{ height: 50, width: '100%' }}
        onValueChange={(itemValue, itemIndex) => setSelectedOption(itemValue)}
      >
        <Picker.Item label="שנה את שם התצוגה" value="displayName" />
        {/* <Picker.Item label="Change Email" value="email" /> */}
        <Picker.Item label="שנה סיסמא" value="password" />
      </Picker>

      {renderFieldsBasedOnOption()}

      <TouchableOpacity style={styles.button} onPress={selectedOption === 'password' ? handleChangePassword : handleUpdateProfile}>
        <Text style={styles.buttonText}>{selectedOption === 'password' ? 'שנה סיסמא' : 'עדכן פרופיל'}</Text>
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

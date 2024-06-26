import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import firebase from './../firebase';
import RNPickerSelect from 'react-native-picker-select';

const EditProfileScreen = ({ navigation }) => {
  const [selectedOption, setSelectedOption] = useState('');
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
        await user.updateProfile(updates);
        await firebase.firestore().collection('users').doc(user.uid).update({ displayName: updates.displayName });
        setDisplayName(updates.displayName);
      } else if (selectedOption === 'email') {
        updates.email = email.trim();
        await user.updateEmail(updates.email);
        await firebase.firestore().collection('users').doc(user.uid).update({ email: updates.email });
        setEmail(updates.email);
      }

      Alert.alert('הפרופיל עודכן', 'הפרופיל שלך עודכן בהצלחה');
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
          placeholder="שם משתמש חדש"
          value={displayName}
          onChangeText={setDisplayName}
        />
      );
    } else if (selectedOption === 'email') {
      return (
        <TextInput
          style={styles.input}
          placeholder="מייל חדש"
          value={email}
          onChangeText={setEmail}
        />
      );
    } else if (selectedOption === 'password') {
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

      <RNPickerSelect
        onValueChange={(itemValue) => setSelectedOption(itemValue)}
        items={[
          { label: 'שנה את שם התצוגה', value: 'displayName' },
          { label: 'שנה סיסמא', value: 'password' },
        ]}
        style={pickerSelectStyles}
        value={selectedOption}
        placeholder={{ label: 'בחר אפשרות', value: '' }}
      />

      {selectedOption && (
        <View style={styles.inputContainer}>
          {renderFieldsBasedOnOption()}

          <TouchableOpacity
            style={styles.button}
            onPress={selectedOption === 'password' ? handleChangePassword : handleUpdateProfile}
          >
            <Text style={styles.buttonText}>{selectedOption === 'password' ? 'שנה סיסמא' : 'עדכן פרופיל'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
    marginBottom: 20, 
    textAlign: 'right'
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    marginBottom: 20, 
    textAlign: 'right'
  },
});

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
  inputContainer: {
    marginTop: 20, 
    width: '100%',
    alignItems: 'center',
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingLeft: 10,
    textAlign:'right',
    
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

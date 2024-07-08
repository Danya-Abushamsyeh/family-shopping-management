import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Modal } from 'react-native';
import firebase from './../firebase';

const EditProfileScreen = ({ navigation }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

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
      navigation.navigate('Profile'); 
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

      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectorButtonText}>מה ברוצונך לשנות/לעדכן ? </Text>
      </TouchableOpacity>

      {selectedOption && (
        <View style={styles.inputContainer}>
          {renderFieldsBasedOnOption()}

          <TouchableOpacity
            style={styles.button}
            onPress={selectedOption === 'password' ? handleChangePassword : handleUpdateProfile}
          >
            <Text style={styles.buttonText}>{selectedOption === 'password' ? 'שנה סיסמא' : 'שמירה'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => { setSelectedOption('displayName'); setModalVisible(false); }}
            >
              <Text style={styles.modalOptionText}>שנה את שם התצוגה</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => { setSelectedOption('email'); setModalVisible(false); }}
            >
              <Text style={styles.modalOptionText}>שנה מייל</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => { setSelectedOption('password'); setModalVisible(false); }}
            >
              <Text style={styles.modalOptionText}>שנה סיסמא</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOption, styles.modalCancel]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalOptionText}>בטל</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  selectorButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginBottom: 30,
  },
  selectorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#635A5A',
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  modalOption: {
    width: '100%',
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#635A5A',
  },
  modalCancel: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
});

export default EditProfileScreen;

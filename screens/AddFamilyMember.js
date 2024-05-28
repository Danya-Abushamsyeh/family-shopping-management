import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { auth, firestore } from './../firebase';

const AddFamilyMember = () => {
  const [email, setEmail] = useState('');

  const addFamilyMember = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userSnapshot = await firestore.collection('users').where('email', '==', email).get();
        if (!userSnapshot.empty) {
          const familyMemberId = userSnapshot.docs[0].id;
  
          // Get the current user's document reference
          const currentUserRef = firestore.collection('users').doc(currentUser.uid);
  
          // Get the current user's data
          const currentUserData = (await currentUserRef.get()).data();
  
          // Initialize the 'family' field as an empty array if it doesn't exist
          const family = currentUserData.family || [];
  
          // Check if the familyMemberId is already in the family array
          if (!family.includes(familyMemberId)) {
            // Update the 'family' field with arrayUnion
            await currentUserRef.update({
              family: [...family, familyMemberId]
            });
  
            // Similarly, update the family member's document
            const familyMemberRef = firestore.collection('users').doc(familyMemberId);
            const familyMemberData = (await familyMemberRef.get()).data();
            const familyMemberFamily = familyMemberData.family || [];
            if (!familyMemberFamily.includes(currentUser.uid)) {
              await familyMemberRef.update({
                family: [...familyMemberFamily, currentUser.uid]
              });
            }
  
            Alert.alert('Success', 'Family member added successfully.');
          } else {
            Alert.alert('Error', 'Family member already exists.');
          }
        } else {
          Alert.alert('Error', 'User not found.');
        }
      } catch (error) {
        console.error('Error adding family member:', error);
        Alert.alert('Error', 'Failed to add family member. Please try again later.');
      }
    }
  };
  
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter family member's email:</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity style={styles.button} onPress={addFamilyMember}>
        <Text style={styles.buttonText}>Add Family Member</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    marginBottom: 10,
    fontSize: 16,
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  button: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default AddFamilyMember;

import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CreateListScreen = () => {
  const navigation = useNavigation();
  const [listName, setListName] = useState('');

  const handleCreateList = () => {
    if (listName.trim() === '') {
      Alert.alert('Error', 'Please enter a name for the list');
      return;
    }
    // Add logic to create the list in Firestore
    // Example: firestore().collection('lists').add({ name: listName })
    // Then navigate back to the previous screen
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TextInput
        style={{ height: 40, width: 300, borderColor: 'gray', borderWidth: 1, marginBottom: 20 }}
        placeholder="Enter list name"
        onChangeText={setListName}
      />
      <Button title="Create List" onPress={handleCreateList} />
    </View>
  );
};

export default CreateListScreen;
const styles = StyleSheet.create({});
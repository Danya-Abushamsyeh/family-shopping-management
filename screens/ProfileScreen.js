import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import firebase, { auth, firestore, getUserDocument, createShoppingList, deleteShoppingList } from './../firebase';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocument = await getUserDocument(currentUser.uid);
        setUserData(userDocument);
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

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      Alert.alert('List Name Required', 'Please enter a name for the new shopping list.');
      return;
    }
    const listName = newListName.trim();
    const items = []; //empty array of items
    try {
      const listId = await createShoppingList(userData.email, listName, items);
      console.log('New list created with ID:', listId);
      setNewListName('');
    } catch (error) {
      console.error('Error creating shopping list:', error);
    }
  };

  const handleDeleteList = async (listId) => {
    const confirmDelete = await Alert.alert(
      'Delete Shopping List',
      'Are you sure you want to delete this shopping list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteShoppingList(userData.email, listId);
              console.log('Shopping list deleted successfully');
            } catch (error) {
              console.error('Error deleting shopping list:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {userData && (
        <View style={styles.header}>
          <Text style={styles.username}>{userData.displayName}</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </View>
      )}

      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionItem} onPress={handleEditProfile}>
          <Text style={styles.optionText}>Edit Profile</Text>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter list name..."
            value={newListName}
            onChangeText={setNewListName}
          />
          <TouchableOpacity style={styles.createButton} onPress={handleCreateList}>
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>

        {userData && userData.shoppingLists && userData.shoppingLists.map(list => (
          <TouchableOpacity
            key={list.id}
            style={styles.optionItem}
            onPress={() => navigation.navigate('ShoppingList', { shoppingList: list })}
            onLongPress={() => handleDeleteList(list.id)}
          >
            <Text style={styles.optionText}>{list.listName}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.optionItem} onPress={handleSignOut}>
          <Text style={styles.optionText}>Log Out</Text>
        </TouchableOpacity>
      </View>
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
  username: {
    fontSize: 20,
    fontWeight: 'bold',
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
  createButton: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

// SupermarketListsScreen.js
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth, firestore } from './../firebase';
import React, { useEffect, useState } from 'react';

const SupermarketListsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { supermarketName } = route.params;
  const [lists, setLists] = useState([]);

  useEffect(() => {
    const fetchLists = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userRef = firestore.collection('users').doc(currentUser.uid);
        const listsSnapshot = await userRef.collection('shoppingLists').doc(supermarketName).collection('lists').get();
        const listsData = listsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setLists(listsData);
      }
    };
    fetchLists();
  }, [supermarketName]);

  const handleListPress = (listName) => {
    navigation.navigate('ShoppingList', { supermarketName, listName });
  };

  const renderListItem = ({ item }) => (
    <TouchableOpacity style={styles.listItem} onPress={() => handleListPress(item.id)}>
      <Text style={styles.listName}>{item.listName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{supermarketName} Lists</Text>
      <FlatList
        data={lists}
        renderItem={renderListItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginTop:51,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  listItem: {
    padding: 15,
    backgroundColor: '#e9a1a1',
    borderRadius: 5,
    marginBottom: 10,
  },
  listName: {
    fontSize: 18,
  },
});

export default SupermarketListsScreen;

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { auth, firestore } from './../firebase';

const ListsScreen = () => {
  const [lists, setLists] = useState([]);

  useEffect(() => {
    const fetchLists = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        console.log('Fetching lists for user:', currentUser.uid);
        const userRef = firestore.collection('users').doc(currentUser.uid);
        const shoppingListsSnapshot = await userRef.collection('shoppingLists').get();
  
   
        const listsData = [];
        for (const shoppingListDoc of shoppingListsSnapshot.docs) {
          const supermarketName = shoppingListDoc.id;
          const listsSnapshot = await shoppingListDoc.ref.collection('lists').get();
          for (const listDoc of listsSnapshot.docs) {
            listsData.push({
              supermarketName,
              listName: listDoc.data().listName || listDoc.id,
              items: listDoc.data().items || [],
            });
          }
        }
        console.log('Fetched lists:', listsData);
        setLists(listsData);
      }
    };
    fetchLists();
  }, []);
  
  const renderItem = ({ item }) => (
    <View style={styles.listContainer}>
      <Text style={styles.supermarketName}>{item.supermarketName}</Text>
      <Text style={styles.listName}>{item.listName}</Text>
      <FlatList
        data={item.items}
        renderItem={({ item }) => <Text>{item.ItemName}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={lists}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  listContainer: {
    marginBottom: 20,
  },
  supermarketName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listName: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default ListsScreen;

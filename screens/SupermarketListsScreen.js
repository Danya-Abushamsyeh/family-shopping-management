// SupermarketListsScreen.js
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth, firestore } from './../firebase';
import React, { useEffect, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';

const SupermarketListsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { supermarketName } = route.params;
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchLists = () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userRef = firestore.collection('users').doc(currentUser.uid);
        
        const unsubscribe = userRef
          .collection('shoppingLists')
          .doc(supermarketName)
          .collection('lists')
          .onSnapshot((snapshot) => {
            const listsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLists(listsData);
            setLoading(false); // Set loading to false once data is fetched
          });

        return () => unsubscribe();
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
      {loading ? ( 
        <ActivityIndicator size="large" color="#e9a1a1" />
      ) : (
        <FlatList
          data={lists}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
        />
      )}
       <TouchableOpacity onPress={() => navigation.navigate('ListItems', { supermarketName })} style={styles.backButton}>
            <FontAwesome name="arrow-left" style={styles.backIcon} />
            <Text style={styles.backText}>חזור לרשימת המוצרים</Text>
       </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginTop: 51,
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    // padding: 5,
    // marginTop: 10,
  },
  backIcon: {
    fontSize: 20,
    color: '#e9a1a1',
    marginRight: 10,
  },
  backText: {
    fontSize: 16,
    color: '#e9a1a1',
  },
});

export default SupermarketListsScreen;

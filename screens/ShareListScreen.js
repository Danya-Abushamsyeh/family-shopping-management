// SharedListsScreen.js
import React, { useState, useEffect, useCallback  } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, firestore } from './../firebase';

const ShareList = () => {
  const navigation = useNavigation();
  const [sharedLists, setSharedLists] = useState([]);
  const [receivedLists, setReceivedLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

    const fetchLists = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userRef = firestore.collection('users').doc(currentUser.uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();

        // Fetch shared lists
        const sharedListsData = [];
        if (userData.sharedLists) {
          for (const { listName, supermarketName } of userData.sharedLists) {
            const sharedListRef = firestore.collection('sharedLists').doc(listName);
            const sharedDoc = await sharedListRef.get();
            if (sharedDoc.exists) {
              sharedListsData.push({ id: sharedDoc.id, supermarketName, ...sharedDoc.data() });
            }
          }
        }

        // Fetch received lists
        const receivedListsData = [];
        if (userData.receivedLists) {
          for (const { listName, supermarketName } of userData.receivedLists) {
            const receivedListRef = firestore.collection('sharedLists').doc(listName);
            const receivedDoc = await receivedListRef.get();
            if (receivedDoc.exists) {
              receivedListsData.push({ id: receivedDoc.id, supermarketName, ...receivedDoc.data() });
            }
          }
        }

        setSharedLists(sharedListsData);
        setReceivedLists(receivedListsData);
        setLoading(false);
        setRefreshing(false);
      }
    };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLists();
  }, []);

  const handleListPress = (listName, supermarketName) => {
    navigation.navigate('ShoppingList', { supermarketName, listName });
  };

  const renderListItem = ({ item }) => (
    <TouchableOpacity style={styles.listItem} onPress={() => handleListPress(item.id, item.supermarketName)}>
      <Text style={styles.listName}>{item.listName}</Text>
      <Text style={styles.supermarketName}>{item.supermarketName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>רשימות משותפות</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#e9a1a1" />
      ) : (
        <>
          <Text style={styles.sectionTitle}>רשימות ששותפו על ידך</Text>
          <FlatList
            data={sharedLists}
            renderItem={renderListItem}
            keyExtractor={(item) => item.id}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
          <Text style={styles.sectionTitle}>רשימות ששותפו איתך</Text>
          <FlatList
            data={receivedLists}
            renderItem={renderListItem}
            keyExtractor={(item) => item.id}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    marginTop:45,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign:'right'
  },
  listItem: {
    padding: 15,
    backgroundColor: '#e9a1a1',
    borderRadius: 5,
    marginBottom: 10,
  },
  listName: {
    fontSize: 18,
    textAlign:'right'
  },
  supermarketName: {
    fontSize: 14,
    color: '#555',
    textAlign:'right'
  },
});

export default ShareList;

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
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
      try {
        const userRef = firestore.collection('users').doc(currentUser.uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();

        const sharedListsData = [];
        const receivedListsData = [];

        // Fetch both shared and received lists
        await Promise.all([
          // Fetch shared lists
          ...(userData.sharedLists || []).map(async ({ listName, supermarketName }) => {
            const sharedListRef = firestore.collection('sharedLists').doc(listName);
            const sharedDoc = await sharedListRef.get();
            if (sharedDoc.exists) {
              const sharedWith = sharedDoc.data().sharedWith || [];
              const sharedWithNames = sharedWith.map(member => member.displayName).join(', ');
              sharedListsData.push({ id: listName, supermarketName, sharedWithNames, ...sharedDoc.data() });
            }
          }),

          // Fetch received lists
          ...(userData.receivedLists || []).map(async ({ listName, supermarketName, sharedBy }) => {
            const receivedListRef = firestore.collection('sharedLists').doc(listName);
            const receivedDoc = await receivedListRef.get();
            if (receivedDoc.exists) {
              receivedListsData.push({ id: listName, supermarketName, sharedBy, ...receivedDoc.data() });
            }
          })
        ]);

        setSharedLists(sharedListsData);
        setReceivedLists(receivedListsData);
        setLoading(false);
        setRefreshing(false);
      } catch (error) {
        console.error('Error fetching lists:', error);
        Alert.alert('שגיאה', 'בעיה בטעינת הרשימות. בבקשה נסה שוב מאוחר יותר.');
        setLoading(false);
        setRefreshing(false);
      }
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

  const renderListItem = ({ item, sharedList }) => (
    <TouchableOpacity style={styles.listItem} onPress={() => handleListPress(item.id, item.supermarketName)}>
      <Text style={styles.listName}>{item.listName}</Text>
      <Text style={styles.supermarketName}>{item.supermarketName}</Text>
      {sharedList ? (
        <Text style={styles.sharedWithNames}>שותף עם: {item.sharedWithNames}</Text>
      ) : (
        <Text style={styles.sharedBy}>שותף על ידי: {item.sharedBy}</Text>
      )}
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
            renderItem={({ item }) => renderListItem({ item, sharedList: true })}
            keyExtractor={(item) => item.id}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
          <Text style={styles.sectionTitle}>רשימות ששותפו איתך</Text>
          <FlatList
            data={receivedLists}
            renderItem={({ item }) => renderListItem({ item, sharedList: false })}
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
    marginTop: 45,
    color: '#635A5A'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'right',
    color: '#635A5A'
  },
  listItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#e9a1a1',
    borderRadius: 4,
    marginBottom: 8,
  },
  listName: {
    fontSize: 18,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#fff'
  },
  supermarketName: {
    fontSize: 12,
    color: '#555',
    textAlign: 'right'
  },
  sharedWithNames: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'right'
  },
  sharedBy: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'right'
  },
});

export default ShareList;

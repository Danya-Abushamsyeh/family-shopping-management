import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, firestore } from './../firebase';
import { FontAwesome } from '@expo/vector-icons';

const ShareList = () => {
  const navigation = useNavigation();
  const [sharedLists, setSharedLists] = useState([]);
  const [receivedLists, setReceivedLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLists = async () => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      try {
        const userRef = firestore.collection('users').doc(currentUser.uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        const userDisplayName = userData.displayName;

        const sharedListsData = [];
        const receivedListsData = [];

        await Promise.all([
          ...(userData.sharedLists || []).map(async ({ listName, supermarketName }) => {
            const sharedListRef = firestore.collection('sharedLists').doc(listName);
            const sharedDoc = await sharedListRef.get();
            if (sharedDoc.exists) {
              const sharedWith = sharedDoc.data().sharedWith || [];
              const sharedWithNames = sharedWith.map(member => member.displayName).join(', ');
              sharedListsData.push({ id: listName, listName, supermarketName, sharedWithNames, ...sharedDoc.data() });
            }
          }),

          ...(userData.receivedLists || []).map(async ({ listName, supermarketName, sharedBy }) => {
            if (!sharedListsData.some(list => list.id === listName) && sharedBy !== userDisplayName) {
              const receivedListRef = firestore.collection('sharedLists').doc(listName);
              const receivedDoc = await receivedListRef.get();
              if (receivedDoc.exists) {
                receivedListsData.push({ id: listName, listName, supermarketName, sharedBy, ...receivedDoc.data() });
              }
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
    <TouchableOpacity style={styles.listItem} onPress={() => handleListPress(item.listName, item.supermarketName)}>
      <View style={styles.listItemContent}>
        <FontAwesome name="bars" size={20} color="#fff" style={styles.listIcon} />
        <View style={styles.listTextContainer}>
          <Text style={styles.listName}>{item.listName}</Text>
          <Text style={styles.supermarketName}>{item.supermarketName}</Text>
          {sharedList ? (
            <Text style={styles.sharedWithNames}>שותף עם: {item.sharedWithNames}</Text>
          ) : (
            <Text style={styles.sharedBy}>שותף על ידי: {item.sharedBy}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const filteredSharedLists = sharedLists.filter(list =>
    list.listName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredReceivedLists = receivedLists.filter(list =>
    list.listName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>רשימות משותפות</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="חפש רשימה..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#e9a1a1" />
      ) : (
        <>
          <Text style={styles.sectionTitle}>רשימות ששותפו על ידך</Text>
          <FlatList
            data={filteredSharedLists}
            renderItem={({ item }) => renderListItem({ item, sharedList: true })}
            keyExtractor={(item) => item.id}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={<Text style={styles.emptyText}>אין רשימות ששותפו על ידך</Text>}
          />
          <Text style={styles.sectionTitle}>רשימות ששותפו איתך</Text>
          <FlatList
            data={filteredReceivedLists}
            renderItem={({ item }) => renderListItem({ item, sharedList: false })}
            keyExtractor={(item) => item.id}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={<Text style={styles.emptyText}>אין רשימות ששותפו איתך</Text>}
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
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 45,
    color: '#635A5A',
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    textAlign:'right'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'right',
    color: '#635A5A',
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
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIcon: {
    marginRight: 10,
  },
  listTextContainer: {
    flex: 1,
  },
  listName: {
    fontSize: 18,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#fff',
  },
  supermarketName: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'right',
  },
  sharedWithNames: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'right',
  },
  sharedBy: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 16,
    marginTop: 20,
  },
});

export default ShareList;

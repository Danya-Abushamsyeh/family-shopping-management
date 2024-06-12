// SupermarketListsScreen.js
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth, firestore } from './../firebase';
import React, { useEffect, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import CustomPrompt from './../CustomModal/CustomPrompt';

const SupermarketListsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { supermarketName } = route.params;
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [listName, setListName] = useState('');

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

  const handlePromptSubmit = async (name) => {
    if (name) {
      setListName(name);
      setIsModalVisible(false);
      await createList(name);
    } else {
      Alert.alert('שגיאה', 'שם רשימת הקניות לא יכול להיות ריק');
      // navigation.goBack();
    }
  };

  const createList = async (name) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userRef = firestore.collection('users').doc(currentUser.uid);
      const supermarketRef = userRef.collection('shoppingLists').doc(supermarketName);
      const listRef = supermarketRef.collection('lists').doc(name);

      await listRef.set({ listName: name, items: [] }, { merge: true });
    }
  };

  const renderListItem = ({ item }) => (
    <TouchableOpacity style={styles.listItem} onPress={() => handleListPress(item.id)}>
      <Text style={styles.listName}>{item.listName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <CustomPrompt
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handlePromptSubmit}
      />
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

      <TouchableOpacity style={styles.createListButton} onPress={() => setIsModalVisible(true)}>
        <FontAwesome name='plus' size={22} color="white" />
        <Text style={styles.createListButtonText}>ליצור רשימה חדשה</Text>
      </TouchableOpacity>
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
    padding: 18,
    backgroundColor: '#e9a1a1',
    borderRadius: 5,
    marginBottom: 10,
  },
  listName: {
    fontSize: 18,
  },
    createListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
    backgroundColor: '#e9a1a1',
    borderRadius: 5,
    margin: 5
  },
  createListButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    // marginLeft: 10,
    // paddingHorizontal:110
    paddingLeft:170
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
    marginRight: 12,
    left:9
  },
  backText: {
    fontSize: 16,
    color: '#e9a1a1',
    fontWeight: 'bold',

  },
});

export default SupermarketListsScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { auth, firestore } from './../firebase';
import { getItemsBySupermarket } from './../firebase';
import CustomPrompt from './../CustomModal/CustomPrompt';

const CombinedScreen = () => {
  const navigation = useNavigation();
  const [supermarkets, setSupermarkets] = useState([]);
  const [selectedSupermarket, setSelectedSupermarket] = useState('');
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [shoppingList, setShoppingList] = useState([]);
  const [listName, setListName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchSupermarkets = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = firestore.collection('users').doc(currentUser.uid);
        const snapshot = await userRef.collection('shoppingLists').get();
        const supermarketsData = snapshot.docs.map(doc => doc.id);
        setSupermarkets(supermarketsData);
      }
    };
    fetchSupermarkets();
  }, []);

  useEffect(() => {
    const fetchLists = async () => {
      if (selectedSupermarket) {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userRef = firestore.collection('users').doc(currentUser.uid);
          const listsSnapshot = await userRef.collection('shoppingLists').doc(selectedSupermarket).collection('lists').get();
          const listsData = listsSnapshot.docs.map(doc => doc.id);
          setLists(listsData);
        }
      }
    };
    fetchLists();
  }, [selectedSupermarket]);

  useEffect(() => {
    const fetchItems = async () => {
      if (selectedList) {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const listDoc = await firestore
            .collection('users')
            .doc(currentUser.uid)
            .collection('shoppingLists')
            .doc(selectedSupermarket)
            .collection('lists')
            .doc(selectedList)
            .get();

          if (listDoc.exists) {
            const { items } = listDoc.data();
            setShoppingList(items || []);
            setItems(items || []);
          } else {
            console.log('Document does not exist!');
          }
        }
      }
    };
    fetchItems();
  }, [selectedList]);

  const handlePromptSubmit = (name) => {
    if (name) {
      setListName(name);
      setIsModalVisible(false);
    } else {
      Alert.alert('Error', 'Shopping list name cannot be empty');
    }
  };

  const filteredItems = items.filter(item =>
    item.ItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.ItemCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToShoppingList = async (item) => {
    const currentUser = auth.currentUser;
    if (currentUser && selectedList) {
      const userRef = firestore.collection('users').doc(currentUser.uid);
      const supermarketRef = userRef.collection('shoppingLists').doc(selectedSupermarket);
      const listRef = supermarketRef.collection('lists').doc(selectedList);
      const listSnapshot = await listRef.get();

      let updatedList;
      if (listSnapshot.exists) {
        updatedList = listSnapshot.data().items || [];
        const existingItem = updatedList.find(i => i.ItemCode === item.ItemCode);
        if (existingItem) {
          updatedList = updatedList.map(i =>
            i.ItemCode === item.ItemCode ? { ...i, quantity: (i.quantity || 1) + 1 } : i
          );
        } else {
          updatedList.push({ ...item, quantity: 1 });
        }
      } else {
        updatedList = [{ ...item, quantity: 1 }];
      }

      await listRef.set({ listName: selectedList, items: updatedList }, { merge: true });
      setShoppingList(updatedList);
    } else {
      Alert.alert('Error', 'Shopping list name is not set. Please try again.');
    }
  };

  const renderSupermarketItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.ItemName}</Text>
      <Text style={styles.ItemCode}>קוד המוצר: {item.ItemCode}</Text>
      <Text style={styles.itemPrice}>מחיר: {item.ItemPrice}</Text>
      <TouchableOpacity onPress={() => addToShoppingList(item)}>
        <FontAwesome name='plus' size={22} color="gray" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Supermarket and List</Text>
      
      <Picker
        selectedValue={selectedSupermarket}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedSupermarket(itemValue)}
      >
        <Picker.Item label="Select a supermarket" value="" />
        {supermarkets.map((supermarket) => (
          <Picker.Item key={supermarket} label={supermarket} value={supermarket} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedList}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedList(itemValue)}
      >
        <Picker.Item label="Select a list" value="" />
        {lists.map((list) => (
          <Picker.Item key={list} label={list} value={list} />
        ))}
      </Picker>

      <CustomPrompt
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handlePromptSubmit}
      />

      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.searchButton} onPress={() => setSearchQuery('')}>
          <FontAwesome name='search' />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="חפש מוצר..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <TouchableOpacity style={styles.createListButton} onPress={() => setIsModalVisible(true)}>
        <FontAwesome name='plus' size={22} color="white" />
        <Text style={styles.createListButtonText}>ליצור רשימה חדשה</Text>
      </TouchableOpacity>

      <Text style={styles.supermarketName}>רשימת המוצרים</Text>

      <FlatList
        data={filteredItems}
        renderItem={renderSupermarketItem}
        keyExtractor={item => item.id.toString()}
      />

      <TouchableOpacity style={styles.listButton} onPress={() => navigation.navigate('SupermarketLists', { supermarketName: selectedSupermarket })}>
        <FontAwesome name="list" size={24} color="white" style={styles.listIcon} />
        <Text style={styles.listButtonText}>הצג את הרשימות שלי</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop:40
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchButton: {
    marginRight: 10,
  },
  createListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#635A5A',
    borderRadius: 8,
    marginBottom: 20,
  },
  createListButtonText: {
    color: 'white',
    marginLeft: 10,
  },
  supermarketName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ItemCode: {
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 14,
  },
  listButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#635A5A',
    borderRadius: 8,
  },
  listButtonText: {
    color: 'white',
    marginLeft: 10,
  },
});

export default CombinedScreen;

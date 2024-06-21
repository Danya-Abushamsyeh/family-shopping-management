import React, { useState, useEffect } from 'react';
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { auth, firestore } from './../firebase';
import { getItemsBySupermarket } from './../firebase';
import CustomPrompt from './../CustomModal/CustomPrompt';

const ListItemsScreen = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { supermarketName, listName: selectedListName } = route.params || {};
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [shoppingList, setShoppingList] = useState([]);
  const [listName, setListName] = useState(selectedListName);
  const [isModalVisible, setIsModalVisible] = useState(!selectedListName);
  const [loading, setLoading] = useState(true);
  const [isSharedList, setIsSharedList] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      const itemsData = await getItemsBySupermarket(supermarketName);
      setItems(itemsData);
      setLoading(false);
    };
    fetchItems();
  }, [supermarketName, isFocused]);

  const createList = async (name) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userRef = firestore.collection('users').doc(currentUser.uid);
      const supermarketRef = userRef.collection('shoppingLists').doc(supermarketName);
      const listRef = supermarketRef.collection('lists').doc(name);

      await listRef.set({ listName: name, items: [] }, { merge: true });
    }
  };

  const filteredItems = items.filter(item =>
    item.ItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.ItemCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToShoppingList = async (item) => {
    const currentUser = auth.currentUser;
    if (currentUser && selectedListName) {
      let listRef;
      let updatedList = [];
      let sharedListRef;
    
      // Identify the correct list reference
      if (isSharedList) {
        sharedListRef = firestore.collection('sharedLists').doc(selectedListName);
      } else {
        const userRef = firestore.collection('users').doc(currentUser.uid);
        const supermarketRef = userRef.collection('shoppingLists').doc(supermarketName);
        listRef = supermarketRef.collection('lists').doc(selectedListName);
      }
    
      // Check if the list exists
      const listSnapshot = isSharedList ? await sharedListRef.get() : await listRef.get();
    
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
    
        // Update the list with the new item
        if (isSharedList) {
          await sharedListRef.update({ items: updatedList });
          
          // Propagate updates to collaborators' received lists
          const sharedDoc = await sharedListRef.get();
          const sharedData = sharedDoc.data();
          for (const sharedUserId of sharedData.sharedWith) {
            if (sharedUserId !== currentUser.uid) {
              const sharedUserRef = firestore.collection('users').doc(sharedUserId);
              const sharedUserDoc = await sharedUserRef.get();
              const sharedUserData = sharedUserDoc.data();
              const updatedReceivedLists = sharedUserData.receivedLists.map((list) => {
                if (list.listName === selectedListName && list.supermarketName === supermarketName) {
                  return { ...list, items: updatedList };
                }
                return list;
              });
              await sharedUserRef.update({ receivedLists: updatedReceivedLists });
            }
          }
        } else {
          await listRef.update({ items: updatedList });
        }
        setShoppingList(updatedList);
      } else {
        Alert.alert('שגיאה', 'רשימה זו אינה קיימת.');
      }
    } else {
      Alert.alert('שגיאה', 'שם רשימת הקניות לא הוגדר. בבקשה נסה שוב.');
    }
  };
  
  const comparePrices = (item) => {
    navigation.navigate('ComparePrices', { itemCode: item.ItemCode, itemName: item.ItemName });
  };

  const renderSupermarketItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.roww}>
        <TouchableOpacity onPress={() => addToShoppingList(item)}>
          <FontAwesome name='plus' size={22} color="gray" />
        </TouchableOpacity>
        <Image source={{ uri: item.imageUrl || ('https://blog.greendot.org/wp-content/uploads/sites/13/2021/09/placeholder-image.png') }} style={styles.itemImage} />
      </View>
      <Text style={styles.itemName}>{item.ItemName}</Text>
      <Text style={styles.ItemCode}>קוד המוצר: {item.ItemCode}</Text>
      <View style={styles.roww}>
        <TouchableOpacity onPress={() => comparePrices(item)} style={styles.compareButton}>
          <Image source={require('./../assets/images/comper.png')} style={{ width: 25, height: 25 }} />
        </TouchableOpacity>
        <Text style={styles.itemPrice}>מחיר: {item.ItemPrice}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.navItem} onPress={() => alert('בחר מהרשימה למטה או הקלד בחיפוש את שם המוצר שברצונך להוסיף לרשימה שלך')}>
            <Text>עזרה</Text>
          </TouchableOpacity>
        </View>

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

        <TouchableOpacity onPress={() => navigation.navigate('בית')}>
          <Image source={require('./../assets/images/Image.jpg')} style={styles.logo} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.listButton} onPress={() => navigation.navigate('SupermarketLists', { supermarketName })}>
        <FontAwesome name="list" size={24} color="white" style={styles.listIcon} />
        <Text style={styles.listButtonText}>בחר לאיזו רשימה תוסיף או צור רשימה חדשה</Text>
      </TouchableOpacity>

      <Text style={styles.supermarketName}>רשימת המוצרים</Text>
      <Text></Text>

      {loading ? (
        <ActivityIndicator size="large" color="#e9a1a1" />
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderSupermarketItem}
          keyExtractor={item => item.id.toString()}
        />
      )}
      <TouchableOpacity onPress={() => navigation.navigate('ShoppingList', { supermarketName, listName: selectedListName })} style={styles.backButton}>
        <Text style={styles.backText}>חזור לרשימה שלי </Text>
        <FontAwesome name="arrow-right" style={styles.backIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 20,
    marginTop: 39
  },
  logoContainer: {
    height: 90,
    paddingVertical: 5,
    backgroundColor: '#e9a1a1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchContainer: {
    width: 230,
    height: 30,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginTop: 39
  },
  searchInput: {
    flex: 1,
    borderBottomWidth: 1,
    marginBottom: 5,
    textAlign: 'right',
    fontSize: 13
  },
  searchButton: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'right',
    right: 4
  },
  navItem: {
    marginLeft: 20,
    marginTop: 39
  },
  navigation: {
    flexDirection: 'row',
  },
  supermarketItem: {
    marginRight: 10,
    alignItems: 'center',
  },
  supermarketName: {
    marginTop: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#464444',
    fontSize: 18
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    elevation: 2,
    marginRight: 30,
    marginLeft: 30
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    // padding: 5,
    // marginTop: 10,
    left:125
  },
  backIcon: {
    fontSize: 20,
    color: '#e9a1a1',
    left: 120
  },
  backText: {
    fontSize: 16,
    color: '#e9a1a1',
    textAlign:'right',
    left: 110,
    // paddingHorizontal:8

  },
  roww:{
    flexDirection: 'row',
  },
  itemImage: {
    width:50,
    height: 90,
    paddingRight:80,
    marginLeft:220
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'right',
    // left:110,
    // marginTop:20
  },
  itemPrice: {
    color: '#888',
    fontSize: 14,
    textAlign: 'right',
    left:215
  },
  ItemCode: {
    color: '#888',
    fontSize: 13,
    marginLeft: 50,
    textAlign: 'right'
  },
  listButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#e9a1a1',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 10,
    marginBottom: 6
  },
  listButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'right'
  },
  listIcon: {
    paddingHorizontal: 10,
    // right: 85
  },
  createListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e9a1a1',
    borderRadius: 5,
    margin: 10
  },
  createListButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    // marginLeft: 10,
    // paddingHorizontal:110
    paddingLeft:190
  },
  compareButton: {
    marginLeft: 1,
  },
});

export default ListItemsScreen;
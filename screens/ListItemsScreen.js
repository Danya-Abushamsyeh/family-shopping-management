import React, { useState, useEffect } from 'react';
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator  } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { auth, firestore } from './../firebase';
import { getItemsBySupermarket } from './../firebase';
import CustomPrompt from './../CustomModal/CustomPrompt';

const ListItemsScreen = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { supermarketName, listName: selectedListName } = route.params; // Destructure listName from params
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [shoppingList, setShoppingList] = useState([]);
  const [listName, setListName] = useState(selectedListName || '');
  const [isModalVisible, setIsModalVisible] = useState(!selectedListName);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchItems = async () => {
      const itemsData = await getItemsBySupermarket(supermarketName);
      setItems(itemsData);
      setLoading(false);
    };

    fetchItems();
  }, [supermarketName, isFocused]);

  const handlePromptSubmit = (name) => {
    if (name) {
      setListName(name);
      setIsModalVisible(false);
    } else {
      Alert.alert('שגיאה', 'שם רשימת הקניות לא יכול להיות ריק');
      // navigation.goBack();
    }
  };

  const filteredItems = items.filter(item =>
    item.ItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.ItemCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToShoppingList = async (item) => {
    const currentUser = auth.currentUser;
    if (currentUser && listName) {
      const userRef = firestore.collection('users').doc(currentUser.uid);
      const supermarketRef = userRef.collection('shoppingLists').doc(supermarketName);
      const listRef = supermarketRef.collection('lists').doc(listName);
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

      await listRef.set({ listName, items: updatedList }, { merge: true });
      setShoppingList(updatedList);
    } else {
      Alert.alert('שגיאה', 'שם רשימת הקניות לא הוגדר. בבקשה נסה שוב.');
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
      <CustomPrompt
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handlePromptSubmit}
      />

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

      <TouchableOpacity style={styles.createListButton} onPress={() => setIsModalVisible(true)}>
        <FontAwesome name='plus' size={22} color="white" />
        <Text style={styles.createListButtonText}>ליצור רשימה חדשה</Text>
      </TouchableOpacity>

      <Text style={styles.supermarketName}>רשימת המוצרים</Text>

      {loading ? ( 
        <ActivityIndicator size="large" color="#e9a1a1" />
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderSupermarketItem}
          keyExtractor={item => item.id.toString()}
        />
      )}

      <TouchableOpacity style={styles.listButton} onPress={() => navigation.navigate('SupermarketLists', { supermarketName })}>
        <FontAwesome name="list" size={24} color="white" style={styles.listIcon} />
        <Text style={styles.listButtonText}>הצג את הרשימות שלי</Text>
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
  supermarketsContainer: {
    marginTop: 20,
  },
  supermarketItem: {
    marginRight: 10,
    alignItems: 'center',
  },
  supermarketImage: {
    width: 230,
    height: 100,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 50
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
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'right'
  },
  itemPrice: {
    color: '#888',
    fontSize: 14,
    textAlign: 'right'
  },
  ItemCode: {
    color: '#888',
    fontSize: 12,
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
    paddingHorizontal: 90,
    right: 85
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
  }
});

export default ListItemsScreen;

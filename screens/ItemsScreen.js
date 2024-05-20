import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getItemsBySupermarket } from './../firebase';
import React, { useEffect, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons'; 
import { auth, firestore } from './../firebase'; // Ensure you have these imports
import CustomPrompt from './../CustomModal/CustomPrompt';

const ItemsScreen = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { supermarketName } = route.params;
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [shoppingList, setShoppingList] = useState([]);
  const [listName, setListName] = useState('');
  const [firstTime, setFirstTime] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      const itemsData = await getItemsBySupermarket(supermarketName);
      setItems(itemsData);
    };
    fetchItems();

    if (firstTime) {
      setFirstTime(false);
      setIsModalVisible(true);
    }
  }, [supermarketName, isFocused]);

  const handlePromptSubmit = (name) => {
    if (name) {
      setListName(name);
      setIsModalVisible(false);
    } else {
      Alert.alert('Error', 'Shopping list name cannot be empty');
      navigation.goBack(); // Go back if the list name is empty
    }
  };

  const filteredItems = items.filter(item =>
    item.ItemName.toLowerCase().includes(searchQuery.toLowerCase())
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
    }
    else {
      Alert.alert('Error', 'Shopping list name is not set. Please try again.');
    }
  };

  
  const navigateToCreateList = () => {
    navigation.navigate('CreateList'); // Navigate to CreateListScreen
  };
  const navigateToShoppingList = () => {
    navigation.navigate('ShoppingList', { shoppingList });
  };

  const renderSupermarketItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.ItemName}</Text>
      <Text style={styles.ItemCode}>קוד המוצר: {item.ItemCode}</Text>
      <Text style={styles.itemPrice}>מחיר: {item.ItemPrice}</Text>
      <TouchableOpacity onPress={() => addToShoppingList(item)}>
        <FontAwesome name='plus' size={22} color="gray"/> 
      </TouchableOpacity>
    </View>
  );
  
  // const handleChoose = (supermarketName) => {
  //   // setSelectedSupermarket(supermarketName);
  //   navigation.navigate('Items');

  // };

  return (
    <View >
       <CustomPrompt 
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handlePromptSubmit}
      />
      <View style={styles.logoContainer}>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.navItem} onPress={() => alert('בחר מהרשימה למטה או הקלד בחיפוש את שם המוצר שברצונך להוסיף לרשימה שלך')}>
            <Text>עזרה</Text>
          </TouchableOpacity>
          
        </View>
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.searchButton} onPress={() => alert('Searching...')}>
            <FontAwesome name='search' /> 
          </TouchableOpacity>
         <TextInput 
          style={styles.searchInput} 
          placeholder="חפש..." 
          onChangeText={setSearchQuery}
          value={searchQuery} />
       </View>

      <TouchableOpacity  onPress={() => navigation.navigate('בית') }>
        <Image source={require('./../assets/images/Image.jpg')} style={styles.logo} />   
      </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.navItem} onPress={navigateToShoppingList}>
         <FontAwesome name='list' size={22} color="#e9a1a1"/> 
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Lists')}>
        <Text>View My Lists</Text>
      </TouchableOpacity>

      <Text style={styles.supermarketName}>רשימת המוצרים</Text>

      

      <Text></Text>

      <FlatList
        data={filteredItems}
        renderItem={renderSupermarketItem}
        keyExtractor={item => item.id.toString()}
      />
      <View>
      <FlatList />
      </View>

      <FlatList
        data={items}
        renderItem={renderSupermarketItem}
        keyExtractor={(item) => item.ItemCode} // Use a unique key for each item
      />
      
    </View>
  );
};

const styles = StyleSheet.create({

  logo: {
    width: 50,
    height: 50,
    marginRight: 20,
    marginTop:39
  },
  logoContainer: {
    height: 90,
    paddingVertical: 5,
    backgroundColor: '#e9a1a1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navigation: {
    flexDirection: 'row',
  },
  navItem: {
    marginLeft: 20,
    marginTop:39
  },
  searchContainer: {
    width: 230,
    height: 30,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginTop:39
  },
  searchInput: {
    // flex: 1,
    paddingVertical: 8,
    marginLeft: 170,

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
    marginLeft:50
  },
  supermarketName: {
    marginTop: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    color:'#464444',
    fontSize:18
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    elevation: 2,
    marginRight:30,
    marginLeft:30
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemPrice: {
    color: '#888',
    fontSize: 14,
  },
  ItemCode: {
    color: '#888',
    fontSize: 12,
    marginLeft:50
  },
});


export default ItemsScreen;
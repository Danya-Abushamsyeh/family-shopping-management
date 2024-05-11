import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { faSearch, faPlus, faList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { getItemsBySupermarket } from './../firebase';
import React, { useEffect, useState } from 'react';

const supermarkets = [
  { id: 1, name: 'ramilavi', imageUrl: require('./../assets/images/rami.jpg') },
  { id: 2, name: 'osherad', imageUrl: require('./../assets/images/osher.png') },
  { id: 3, name: 'shupersal', imageUrl: require('./../assets/images/shupersl.jpeg') },
  { id: 4, name: 'tivtaam', imageUrl: require('./../assets/images/tiv.jpg') },
  { id: 5, name: 'vectory', imageUrl: require('./../assets/images/vic.jpg') },
];

const ItemsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { supermarketName } = route.params;
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [shoppingList, setShoppingList] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const itemsData = await getItemsBySupermarket(supermarketName);
      setItems(itemsData);
    };
    fetchItems();
  }, [supermarketName]);

  const filteredItems = items.filter(item =>
    item.ItemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToShoppingList = (item) => {
    const existingItem = shoppingList.find(i => i.ItemCode === item.ItemCode);
    if (existingItem) {
      // If item already exists, update its quantity
      const updatedList = shoppingList.map(i =>
        i.ItemCode === item.ItemCode ? { ...i, quantity: (i.quantity || 1) + 1 } : i
      );
      setShoppingList(updatedList);
    } else {
      // If item does not exist, add it with quantity 1
      setShoppingList(prevList => [...prevList, { ...item, quantity: 1 }]);
    }
  };
  

  const navigateToShoppingList = () => {
    navigation.navigate('ShoppingList', { shoppingList });
  };

  const renderSupermarketItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.ItemName}</Text>
      <Text style={styles.itemPrice}>מחיר: {item.ItemPrice}</Text>
      <TouchableOpacity onPress={() => addToShoppingList(item)}>
        <FontAwesomeIcon icon={faPlus} size={24} color="blue" />
      </TouchableOpacity>
    </View>
  );
  
  // const handleChoose = (supermarketName) => {
  //   // setSelectedSupermarket(supermarketName);
  //   navigation.navigate('Items');

  // };

  return (
    <View >
      <View style={styles.logoContainer}>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.navItem} onPress={() => alert('בחר מהרשימה למטה או הקלד בחיפוש את שם המוצר שברצונך להוסיף לרשימה שלך')}>
            <Text>עזרה</Text>
          </TouchableOpacity>
          
        </View>
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.searchButton} onPress={() => alert('Searching...')}>
            <FontAwesomeIcon icon={faSearch} />
          </TouchableOpacity>
         <TextInput 
          style={styles.searchInput} 
          placeholder="חפש..." 
          onChangeText={setSearchQuery}
          value={searchQuery} />
       </View>

      <TouchableOpacity  onPress={() =>navigation.navigate('Home') }>
        <Image source={require('./../assets/images/Image.jpg')} style={styles.logo} />   
      </TouchableOpacity>
      </View>
      <Text style={styles.supermarketName}>רשימת המוצרים</Text>
      <TouchableOpacity style={styles.navItem} onPress={navigateToShoppingList}>
            <FontAwesomeIcon icon={faList} size={24} color="blue" />
      </TouchableOpacity>
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
  },
  logoContainer: {
    paddingVertical: 5,
    backgroundColor: '#e9a1a1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop:35
  },
  navigation: {
    flexDirection: 'row',
  },
  navItem: {
    marginLeft: 20,
  },
  searchContainer: {
    width: 230,
    height: 30,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  searchInput: {
    // flex: 1,
    // paddingVertical: 8,
    marginLeft: 140,

  },
  searchButton: {
    padding: 10,
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
});


export default ItemsScreen;
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getItemsBySupermarket, saveShoppingList } from './../firebase'; // Assuming you have a function to save data to Firestore
import React, { useEffect, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';

const supermarkets = [
  { id: 1, name: 'ramilavi', imageUrl: require('./../assets/images/rami.jpg') },
  { id: 2, name: 'osherad', imageUrl: require('./../assets/images/osher.png') },
  { id: 3, name: 'shupersal', imageUrl: require('./../assets/images/shupersl.jpeg') },
  { id: 4, name: 'tivtaam', imageUrl: require('./../assets/images/tiv.jpg') },
  { id: 5, name: 'vectory', imageUrl: require('./../assets/images/vic.jpg') },
  { id: 6, name: 'Yohananof', imageUrl: require('./../assets/images/images.png') },
  { id: 7},

];

const HomeScreen = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [selectedSupermarket, setSelectedSupermarket] = useState('');

  useEffect(() => {
    if (selectedSupermarket) {
      const fetchItems = async () => {
        const itemsData = await getItemsBySupermarket(selectedSupermarket);
        setItems(itemsData);
      };
      fetchItems();
    }
  }, [selectedSupermarket]);

  const renderSupermarketItem = ({ item }) => (
   <TouchableOpacity style={styles.itemContainer} onPress={() => handleChoose(item.name)}>
      <Image source={item.imageUrl} style={styles.supermarketImage} />
      <Text style={styles.itemName}>{item.ItemName}</Text>
    </TouchableOpacity>
  );
  
  const handleChoose = (supermarketName) => {
    navigation.navigate('Items', { supermarketName});
  };
  

  return (
    <View>
      <View style={styles.logoContainer}>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.navItem} onPress={() => alert('בחר את הסופרמרקט אליו תלך או הקלד בחיפוש את שם המוצר שברצונך להוסיף לרשימה שלך')}>
            <Text>עזרה</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.searchButton} onPress={() => alert('Searching...')}>
            <FontAwesome name='search' /> 
          </TouchableOpacity>
          <TextInput style={styles.searchInput} placeholder="חפש..." />
        </View>
        <Image source={require('./../assets/images/Image.jpg')} style={styles.logo} />
      </View>
      
      <Text style={styles.supermarketName}>בואו להכין את רשימת הקניות שלנו. בחר את הסופרמרקט אליו תלך</Text>
      <FlatList
        data={supermarkets}
        renderItem={renderSupermarketItem}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.supermarketsContainer}
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
    // marginTop:30
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
    flex: 1,
    paddingVertical: 8,
    marginLeft: 140,

  },
  supermarketsContainer: {
    marginTop: 20,
    marginBottom:50
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
    color:'#464444'
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

export default HomeScreen;

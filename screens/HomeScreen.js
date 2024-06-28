// HomeScreen.js
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';

const supermarkets = [
  { id: 1, name: 'Ramilevi', imageUrl: require('./../assets/images/rami.jpg') },
  { id: 2, name: 'Osherad', imageUrl: require('./../assets/images/osher.png') },
  { id: 3, name: 'Shupersal', imageUrl: require('./../assets/images/shupersl.jpeg') },
  { id: 4, name: 'Tivtaam', imageUrl: require('./../assets/images/tiv.jpg') },
  { id: 5, name: 'Victory', imageUrl: require('./../assets/images/vic.jpg') },
  { id: 6, name: 'Yochananof', imageUrl: require('./../assets/images/images.png') },
  { id: 7},

];

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleChoose = (supermarketName) => {
    navigation.navigate('ListItems', { supermarketName});

    // navigation.navigate('SupermarketLists', { supermarketName });
  };

  const renderSupermarketItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleChoose(item.name)}>
      <Image source={item.imageUrl} style={styles.supermarketImage} />
      <Text style={styles.supermarketName}></Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <View style={styles.logoContainer}>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Help')}>
          <FontAwesome name="question-circle" size={21} style={styles.buttonIcon} />
          </TouchableOpacity>
        </View>
        {/* <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.searchButton} onPress={() => alert('Searching...')}>
            <FontAwesome name='search' />
          </TouchableOpacity>
          <TextInput style={styles.searchInput} placeholder="חפש..." />
        </View> */}
        <Image source={require('./../assets/images/Image.jpg')} style={styles.logo} />
      </View>
      <Text style={styles.title}>בואו להכין את רשימת הקניות שלנו. בחר את הסופרמרקט אליו תלך</Text>
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
    marginTop: 39,
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
    marginTop: 39,
  },
  searchContainer: {
    width: 230,
    height: 30,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginTop: 39,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    marginLeft: 140,
  },
  buttonIcon:{
   color:'#fff'
  },
  supermarketsContainer: {
    marginTop: 20,
    marginBottom: 50,
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
    marginLeft: 50,
  },
  supermarketName: {
    marginTop: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#464444',
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    elevation: 2,
    marginRight: 30,
    marginLeft: 30,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    margin: 10,
  },
});

export default HomeScreen;

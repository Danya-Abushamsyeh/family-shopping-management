import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';

const supermarkets = [
  { id: 1, name: 'Ramilevi', imageUrl: require('./../assets/images/rami.jpg') },
  { id: 2, name: 'Osherad',  imageUrl: require('./../assets/images/osher.png') },
  { id: 3, name: 'Shupersal',  imageUrl: require('./../assets/images/shupersl.jpeg') },
  { id: 4, name: 'Tivtaam', imageUrl: require('./../assets/images/tiv.jpg') },
  { id: 5, name: 'Victory',  imageUrl: require('./../assets/images/vic.jpg') },
  { id: 6, name: 'Yochananof', imageUrl: require('./../assets/images/images.png') },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleChoose = (supermarketName) => {
    navigation.navigate('ListItems', { supermarketName });
  };

  const filteredSupermarkets = supermarkets.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSupermarketItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleChoose(item.name)}>
      <Image source={item.imageUrl} style={styles.supermarketImage} />
      <Text style={styles.supermarketName}>{item.name}</Text>
      <Text style={styles.supermarketDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Help')}>
            <FontAwesome name="question-circle" size={21} style={styles.buttonIcon} />
          </TouchableOpacity>
        </View>
        {/* <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.searchButton} onPress={() => setSearchQuery('')}>
          <FontAwesome name='search' />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="חפש..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View> */}
        <Image source={require('./../assets/images/Image.jpg')} style={styles.logo} />
    
      </View>
      <Text style={styles.title}> להכין את רשימת הקניות בחר את הסופרמרקט אליו תלך</Text>

      <FlatList
        data={filteredSupermarkets}
        renderItem={renderSupermarketItem}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.supermarketsContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
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
    width: '90%',
    height: 40,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginVertical: 10,
    alignSelf: 'center',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    marginLeft: 10,
  },
  buttonIcon: {
    color: '#fff',
  },
  supermarketsContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  supermarketItem: {
    marginRight: 10,
    alignItems: 'center',
  },
  supermarketImage: {
    width: '60%',
    height: 130,
    borderRadius: 10,
    alignSelf:'center'
  },
  supermarketName: {
    marginTop: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#464444',
    fontSize: 18,
  },
  supermarketDescription: {
    marginTop: 3,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  itemContainer: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    margin: 10,
    color: '#464444',
  },
});

export default HomeScreen;

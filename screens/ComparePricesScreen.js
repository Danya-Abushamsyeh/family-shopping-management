import React, { useState, useEffect, useCallback } from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { getItemsFromAllSupermarkets, searchItemAcrossSupermarkets } from './../firebase';

const ComparePricesScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { itemCode, itemName } = route.params;
  const [comparisonResults, setComparisonResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComparisonResults = async () => {
    try {
      setLoading(true);  // Start loading when fetching data
      const items = await getItemsFromAllSupermarkets();
      if (!items) {
        throw new Error('Fetched items are null');
      }
      const results = searchItemAcrossSupermarkets(items, itemCode);
      setComparisonResults(results);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);  // End loading after data is fetched
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchComparisonResults();
    }, [itemCode])
  );

  const handleItemPress = (supermarket) => {
    navigation.navigate('ListItems', supermarket);
  };

  const renderComparisonItem = ({ item }) => (
    <TouchableOpacity>
      <View style={styles.itemContainer}>
        <Text style={styles.supermarketName}>סופרמרקט: {item.supermarket}</Text>
        <Text style={styles.itemName}>מוצר: {item.itemName}</Text>
        <Text style={styles.itemPrice}>מחיר: {item.itemPrice}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.navItem} onPress={() => alert('בחר את הסופרמרקט אליו תלך או הקלד בחיפוש את שם המוצר שברצונך להוסיף לרשימה שלך')}>
          </TouchableOpacity>
        </View>
        <Image source={require('./../assets/images/Image.jpg')} style={styles.logo} />
      </View>
    
      <Text style={styles.title}>השוואת מחירים עבור {itemName} {itemCode}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#e9a1a1" />
      ) : (
        <FlatList
          data={comparisonResults}
          renderItem={renderComparisonItem}
          keyExtractor={(item, index) => `${item.supermarket}-${item.itemCode}-${index}`}
        />
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <FontAwesome name="arrow-left" style={styles.backIcon} />
        <Text style={styles.backText}>חזור לרשימת המוצרים </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  supermarketName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  itemName: {
    fontSize: 16,
    textAlign: 'right',
  },
  itemPrice: {
    fontSize: 16,
    textAlign: 'right',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backIcon: {
    fontSize: 20,
    color: '#e9a1a1',
    marginLeft: 10,
  },
  backText: {
    fontSize: 16,
    color: '#e9a1a1',
  },
});

export default ComparePricesScreen;

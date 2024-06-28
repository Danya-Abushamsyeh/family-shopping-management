import React, { useState, useEffect, useCallback } from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { getItemsFromAllSupermarkets, searchItemAcrossSupermarkets } from './../firebase';

const ComparePricesScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { itemCode, itemName, supermarketName } = route.params;
  const [comparisonResults, setComparisonResults] = useState([]);
  const [cheapestSupermarket, setCheapestSupermarket] = useState('');
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

      if (results.length > 0) {
        const cheapest = results.reduce((prev, curr) => (prev.itemPrice < curr.itemPrice ? prev : curr));
        setCheapestSupermarket(cheapest.supermarket);
      }
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
    navigation.navigate('ListItems', { supermarketName: supermarket });
  };

  const renderComparisonItem = ({ item }) => (
    <TouchableOpacity style={styles.listItem}>
      <View style={styles.itemContainer}>
        <Text style={styles.supermarketName}>סופרמרקט: {item.supermarket}</Text>
        <Text style={styles.itemName}>מוצר: {item.itemName}</Text>
        <Text style={styles.itemPrice}>מחיר: {item.itemPrice} ₪</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
      </View>
      <View style={styles.rowww}>
        <Text style={styles.title}>השוואת מחירים עבור {itemName} ({itemCode})</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#e9a1a1" />
      ) : (
        <>
          <FlatList
            data={comparisonResults}
            renderItem={renderComparisonItem}
            keyExtractor={(item, index) => `${item.supermarket}-${item.itemCode}-${index}`}
          />
          {cheapestSupermarket ? (
            <View style={styles.adviceContainer}>
              <Text style={styles.adviceText}>המחיר הזול ביותר נמצא ב: {cheapestSupermarket}. אם אתם מחפשים את המחיר הזול ביותר, לכו לשם.</Text>
            </View>
          ) : null}
        </>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('ListItems', { supermarketName })}>
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
    marginTop: 10,
  },
  logoContainer: {
    height: 50,
    paddingVertical: 5,
    backgroundColor: '#e9a1a1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowww: {
    backgroundColor: '#e9a1a1',
  },
  listItem: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
    marginTop: 20
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
    color: '#fff',
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
  adviceContainer: {
    padding: 10,
    backgroundColor: '#e9a1a1',
    borderRadius: 5,
    margin: 20,
  },
  adviceText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
  },
});

export default ComparePricesScreen;

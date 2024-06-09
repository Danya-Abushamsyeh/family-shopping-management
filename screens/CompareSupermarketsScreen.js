import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { getItemsFromAllSupermarkets } from './../firebase';

const CompareSupermarketsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { shoppingList, supermarketName, listName } = route.params;
  const [comparisonResults, setComparisonResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparisonResults = async () => {
      try {
        const items = await getItemsFromAllSupermarkets();
        const results = calculateComparisonResults(items, shoppingList);
        setComparisonResults(results);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching comparison results:', error);
        setLoading(false);
      }
    };

    fetchComparisonResults();
  }, [shoppingList]);

  const calculateComparisonResults = (allItems, shoppingList) => {
    const supermarkets = Object.keys(allItems);
    const results = supermarkets.map(supermarket => {
      let totalPrice = 0;
      let missingItems = [];

      shoppingList.forEach(item => {
        const foundItem = allItems[supermarket].find(i => i.ItemCode === item.ItemCode);
        if (foundItem) {
          totalPrice += parseFloat(foundItem.ItemPrice) * (item.quantity || 1);
        } else {
          missingItems.push({ itemName: item.ItemName, itemCode: item.ItemCode });
        }
      });

      return {
        supermarket,
        totalPrice,
        missingItems
      };
    });

    return results;
  };

  const renderComparisonItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.supermarketName}>סופרמרקט: {item.supermarket}</Text>
      <Text style={styles.itemPrice}>סה"כ מחיר: {item.totalPrice.toFixed(2)} ₪</Text>
      {item.missingItems.length > 0 && (
        <View>
          <Text style={styles.missingItemsTitle}>פריטים חסרים:</Text>
          {item.missingItems.map((missingItem, index) => (
            <Text key={index} style={styles.missingItem}>{missingItem.itemName} ({missingItem.itemCode})</Text>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/* <TouchableOpacity style={styles.navItem} onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity> */}
        {/* <Image source={require('./../assets/images/Image.jpg')} style={styles.logo} /> */}
      </View>
      <Text style={styles.title}>השוואת מחירים עבור רשימת הקניות שלך</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#e9a1a1" />
      ) : (
        <FlatList
          data={comparisonResults}
          renderItem={renderComparisonItem}
          keyExtractor={(item, index) => `${item.supermarket}-${index}`}
        />
      )}
      <TouchableOpacity onPress={() => navigation.navigate('ShoppingList', { supermarketName, listName })} style={styles.backButton}>
        <FontAwesome name="arrow-left" style={styles.backIcon} />
        <Text style={styles.backText}>חזור לרשימה שלי</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 20,
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
  navItem: {
    marginLeft: 20,
    marginTop: 39,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    backgroundColor: '#e9a1a1',
    color:'#fff',
  },
  itemContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    elevation: 2,
  },
  supermarketName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  itemPrice: {
    fontSize: 16,
    color: 'green',
    textAlign: 'right',
  },
  missingItemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'right'
  },
  missingItem: {
    fontSize: 14,
    color: 'red',
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

export default CompareSupermarketsScreen;

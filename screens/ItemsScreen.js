// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
// import { FontAwesome } from '@expo/vector-icons';
// import { auth, firestore } from './../firebase';
// import { useNavigation, useIsFocused } from '@react-navigation/native';
// import { getItemsBySupermarket } from './../firebase';
// import CustomPrompt from './../CustomModal/CustomPrompt';

// const ItemsScreen = ({ route }) => {
//   const navigation = useNavigation();
//   const isFocused = useIsFocused();
//   const { supermarketName, listName } = route.params;
//   const [items, setItems] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [shoppingList, setShoppingList] = useState([]);
//   const [isModalVisible, setIsModalVisible] = useState(false);

//   useEffect(() => {
//     const fetchItems = async () => {
//       const itemsData = await getItemsBySupermarket(supermarketName);
//       setItems(itemsData);
//     };
//     fetchItems();
//   }, [supermarketName, isFocused]);

//   const handleAddItemToShoppingList = (item) => {
//     setShoppingList(prevList => [...prevList, item]);
//     Alert.alert('הפריט נוסף בהצלחה לרשימה שלך');
//   };

//   const handleSaveShoppingList = async () => {
//     const currentUser = auth.currentUser;
//     if (currentUser) {
//       try {
//         const userRef = firestore.collection('users').doc(currentUser.uid);
//         const shoppingListRef = userRef.collection('shoppingLists').doc(supermarketName).collection('lists').doc(listName);
//         await shoppingListRef.set({ items: shoppingList });
//         Alert.alert('רשימת הקניות נשמרה בהצלחה');
//         setShoppingList([]);
//       } catch (error) {
//         console.error('Error saving shopping list:', error);
//         Alert.alert('שגיאה בשמירת רשימת הקניות');
//       }
//     }
//   };

//   const filteredItems = items.filter(item =>
//     item.ItemName.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const renderItem = ({ item }) => (
//     <TouchableOpacity style={styles.itemContainer} onPress={() => handleAddItemToShoppingList(item)}>
//       <Text style={styles.itemName}>{item.ItemName}</Text>
//       <Text style={styles.itemDetails}>מחיר: {item.ItemPrice}</Text>
//       <Text style={styles.itemDetails}>קוד: {item.ItemCode}</Text>
//       <Text style={styles.itemDetails}>כמות: {item.quantity}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.searchContainer}>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="חפש מוצר..."
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//         />
//         <TouchableOpacity style={styles.searchButton} onPress={() => setSearchQuery('')}>
//           <FontAwesome name='search' />
//         </TouchableOpacity>
//       </View>
//       <FlatList
//         data={filteredItems}
//         renderItem={renderItem}
//         keyExtractor={(item, index) => index.toString()}
//         contentContainerStyle={styles.itemsContainer}
//       />
//       {shoppingList.length > 0 && (
//         <TouchableOpacity style={styles.saveButton} onPress={handleSaveShoppingList}>
//           <Text style={styles.saveButtonText}>שמור רשימה</Text>
//         </TouchableOpacity>
//       )}
//       <CustomPrompt
//         isVisible={isModalVisible}
//         title="הוסף מוצר חדש"
//         onCancel={() => setIsModalVisible(false)}
//         onSubmit={(item) => {
//           handleAddItemToShoppingList(item);
//           setIsModalVisible(false);
//         }}
//       />
//       <TouchableOpacity style={styles.listButton} onPress={() => navigation.navigate('ShoppingList')}>
//         <FontAwesome name="list" size={24} color="black" />
//         <Text style={styles.listButtonText}>רשימה</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     marginBottom: 20,
//   },
//   searchInput: {
//     flex: 1,
//     borderBottomWidth: 1,
//     marginRight: 10,
//     padding: 10,
//   },
//   searchButton: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 10,
//     backgroundColor: '#e9a1a1',
//     borderRadius: 5,
//   },
//   itemsContainer: {
//     paddingBottom: 20,
//   },
//   itemContainer: {
//     backgroundColor: '#f9f9f9',
//     padding: 15,
//     borderRadius: 5,
//     marginBottom: 10,
//     elevation: 1,
//   },
//   itemName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   itemDetails: {
//     fontSize: 14,
//     color: '#555',
//   },
//   saveButton: {
//     padding: 15,
//     backgroundColor: '#e9a1a1',
//     borderRadius: 5,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   saveButtonText: {
//     fontSize: 16,
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   listButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//     backgroundColor: '#e9a1a1',
//     borderRadius: 5,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   listButtonText: {
//     fontSize: 16,
//     color: '#fff',
//     fontWeight: 'bold',
//     marginLeft: 10,
//   },
// });

// export default ItemsScreen;
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import firebase, { firestore, auth } from './../firebase';
import { Share } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; 

const ItemsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { supermarketName, list } = route.params;
  const [shoppingList, setShoppingList] = useState(list.items || []);

  useEffect(() => {
    // Set the shopping list from the passed list data
    if (list) {
      setShoppingList(list.items);
    }
  }, [list]);

  const totalPrice = shoppingList.reduce((acc, item) => acc + (parseFloat(item.ItemPrice) * (item.quantity || 1)), 0);

  const renderItem = ({ item, index }) => (
    <View style={styles.item}>
      <Text style={styles.itemName}>{item.ItemName}</Text>
      <Text style={styles.ItemCode}>קוד המוצר: {item.ItemCode}</Text>
      <Text style={styles.itemPrice}>מחיר: {item.ItemPrice} ₪</Text>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => updateQuantity(index, parseInt(item.quantity || 0) + 1)}>
          <FontAwesome name='plus' style={styles.quantityIcon} />
        </TouchableOpacity>
        <TextInput
          style={styles.quantityInput}
          keyboardType="numeric"
          onChangeText={(text) => updateQuantity(index, text)}
          value={item.quantity ? item.quantity.toString() : ''}
        />
        <TouchableOpacity onPress={() => updateQuantity(index, parseInt(item.quantity || 0) - 1)}>
          <FontAwesome name='minus' style={styles.quantityIcon} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => deleteItem(item)} style={styles.deleteButton}>
        <FontAwesome name='trash' style={styles.deleteIcon} />
      </TouchableOpacity>
    </View>
  );

  const deleteItem = async (itemToDelete) => {
    try {
      const updatedList = shoppingList.filter(item => item !== itemToDelete);
      setShoppingList(updatedList);
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = firestore.doc(`users/${currentUser.uid}`);
        await userRef.collection('shoppingLists').doc(supermarketName).collection('lists').doc(list.listName).update({ items: updatedList });
        Alert.alert('Success', 'Item deleted successfully.');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Error', 'Failed to delete item. Please try again later.');
    }
  };

  const updateQuantity = (index, text) => {
    const updatedList = [...shoppingList];
    updatedList[index].quantity = text;
    setShoppingList(updatedList);
  };

  const clearAllItems = () => {
    Alert.alert(
      'Clear All Items',
      'Are you sure you want to clear all items from the list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => handleClearAllItems() },
      ],
      { cancelable: false }
    );
  };

  const handleClearAllItems = async () => {
    try {
      setShoppingList([]);
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = firestore.doc(`users/${currentUser.uid}`);
        await userRef.collection('shoppingLists').doc(supermarketName).collection('lists').doc(list.listName).update({ items: [] });
        Alert.alert('Success', 'All items cleared successfully.');
      }
    } catch (error) {
      console.error('Error clearing items:', error);
      Alert.alert('Error', 'Failed to clear items. Please try again later.');
    }
  };

  const saveShoppingList = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = firestore.doc(`users/${currentUser.uid}`);
        await userRef.collection('shoppingLists').doc(supermarketName).collection('lists').doc(list.listName).update({ items: shoppingList });
        Alert.alert('Success', 'Shopping list updated successfully.');
      }
    } catch (error) {
      console.error('Error saving shopping list:', error);
      Alert.alert('Error', 'Failed to update shopping list. Please try again later.');
    }
  };

  const handleShare = async () => {
    try {
      const itemsText = shoppingList.map(item => `${item.ItemName}: ${item.quantity}`).join('\n');
      await Share.share({
        message: itemsText,
      });
    } catch (error) {
      console.error('Error sharing shopping list:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{list.listName}</Text>
      <FlatList
        data={shoppingList}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
      />
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={clearAllItems} style={styles.button}>
          <FontAwesome name="trash" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>מחק את הרשימה</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={saveShoppingList} style={styles.button}>
          <FontAwesome name="save" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>שמור את הרשימה</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.button}>
          <FontAwesome name="share" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>שתף את הרשימה</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <FontAwesome name="arrow-left" style={styles.backIcon} />
        <Text style={styles.backText}>חזור לרשימת המוצרים</Text>
      </TouchableOpacity>
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>סה"כ: {totalPrice.toFixed(2)} ₪</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  item: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ItemCode: {
    fontSize: 14,
    color: '#555',
  },
  itemPrice: {
    fontSize: 14,
    color: '#555',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  quantityIcon: {
    fontSize: 20,
    color: '#e9a1a1',
    marginHorizontal: 10,
  },
  quantityInput: {
    width: 40,
    height: 30,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  deleteIcon: {
    fontSize: 20,
    color: '#e9a1a1',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e9a1a1',
    borderRadius: 5,
  },
  buttonIcon: {
    fontSize: 20,
    color: '#fff',
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 10,
  },
  backIcon: {
    fontSize: 20,
    color: '#e9a1a1',
    marginRight: 10,
  },
  backText: {
    fontSize: 16,
    color: '#e9a1a1',
  },
  totalContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ItemsScreen;

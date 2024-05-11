import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faTrash, faPlus, faShare, faSave, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import firebase, { firestore, auth } from './../firebase';
import { Share } from 'react-native';

const ShoppingList = ({ route }) => {
    
  const navigation = useNavigation();
  const [shoppingList, setShoppingList] = useState(route.params.shoppingList);

  const totalPrice = shoppingList.reduce((acc, item) => acc + (parseFloat(item.ItemPrice) * (item.quantity || 1)), 0);

  const renderItem = ({ item, index }) => (
    <View style={styles.item}>
      <Text style={styles.itemName}>{item.ItemName}</Text>
      <Text style={styles.ItemCode} >קוד המוצר: {item.ItemCode}</Text>
      <Text style={styles.itemPrice}>מחיר: {item.ItemPrice} ₪</Text>
      <View style={styles.quantityContainer}>
        <Text style={styles.quantityText}>כמות:</Text>
        <TextInput
          style={styles.quantityInput}
          keyboardType="numeric"
          onChangeText={(text) => updateQuantity(index, text)}
          value={item.quantity ? item.quantity.toString() : ''}
        />
      </View>
      <TouchableOpacity onPress={() => deleteItem(item)} style={styles.deleteButton}>
        <FontAwesomeIcon icon={faTrash} style={styles.deleteIcon} />
      </TouchableOpacity>
    </View>
  );

  const deleteItem = async (itemToDelete) => {
    try {
      // Remove item from local state
      const updatedList = shoppingList.filter(item => item !== itemToDelete);
      setShoppingList(updatedList);
  
      // Delete item from Firestore
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = firestore.doc(`users/${currentUser.uid}`);
        await userRef.update({ shoppingList: updatedList });
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
      // Clear all items from local state
      setShoppingList([]);
  
      // Clear all items from Firestore
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = firestore.doc(`users/${currentUser.uid}`);
        await userRef.update({ shoppingList: [] });
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
        await userRef.update({ shoppingList: shoppingList });
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
  const handleChoose = (supermarketName) => {
    navigation.navigate('Items', { supermarketName });
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>רשימת הקניות שלי</Text>

      <FlatList
        data={shoppingList}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`} // Ensure unique keys
        />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={clearAllItems} style={styles.button}>
          <FontAwesomeIcon icon={faTrashAlt} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>מחק את הרשימה</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={saveShoppingList} style={styles.button}>
          <FontAwesomeIcon icon={faSave} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>שמור את הרשימה</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.button}>
          <FontAwesomeIcon icon={faShare} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>שתף את הרשימה</Text>
        </TouchableOpacity>
      </View>

     <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <FontAwesomeIcon icon={faArrowLeft} style={styles.backIcon} />
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
    marginTop:50
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  totalContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  ItemCode: {
    color: '#888',
    fontSize: 12,
    marginLeft:50
  },
  itemPrice: {
    color: '#888',
    fontSize: 14,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backIcon: {
    marginRight: 5,
  },
  backText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  deleteButton: {
    alignSelf: 'right',
  },
  deleteIcon: {
    color: 'red',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    marginRight: 5,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    width: 35,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonIcon: {
    marginLeft: 223,
    marginHorizontal: 7
  },
  buttonText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },

});

export default ShoppingList;

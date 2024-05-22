import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import firebase, { firestore, auth } from './../firebase';
import { Share } from 'react-native';

const ShoppingList = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { supermarketName, listName } = route.params || {};
  const [shoppingList, setShoppingList] = useState([]);
  const [listNameState, setListNameState] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const userId = auth.currentUser.uid;

        const listDoc = await firestore
          .collection('users')
          .doc(userId)
          .collection('shoppingLists')
          .doc(supermarketName)
          .collection('lists')
          .doc(listName)
          .get();

        if (listDoc.exists) {
          const { items, listName: fetchedListName } = listDoc.data();
          // console.log('lists:', listDoc.data());
          setShoppingList(items || []);
          setListNameState(fetchedListName || '');
        } else {
          console.log('Document does not exist!');
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, [route.params]);

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
        await userRef.collection('shoppingLists').doc(supermarketName).collection('lists').doc(listName).update({ items: updatedList });
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
        await userRef.collection('shoppingLists').doc(supermarketName).collection('lists').doc(listName).update({ items: [] });
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
        await userRef.collection('shoppingLists').doc(supermarketName).collection('lists').doc(listName).update({ items: shoppingList });
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
      <Text style={styles.title}>{listNameState}</Text>
      <FlatList
        data={shoppingList}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
      />
       <TouchableOpacity onPress={() => navigation.navigate('ListItems', { supermarketName, listName })} style={styles.backButton}>
        <FontAwesome name="arrow-left" style={styles.backIcon} />
        <Text style={styles.backText}>חזור לרשימת המוצרים</Text>
      </TouchableOpacity>
      
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>סה"כ: {totalPrice.toFixed(2)} ₪</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={clearAllItems} style={styles.button}>
          <FontAwesome name="trash" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>מחק את הרשימה</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={saveShoppingList} style={styles.button}>
          <FontAwesome name="save" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>שמור שינויים</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.button}>
          <FontAwesome name="share" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>שתף את הרשימה</Text>
        </TouchableOpacity>
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
    marginTop:50,
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
    textAlign:'right'
  },
  ItemCode: {
    fontSize: 14,
    color: '#555',
    textAlign:'right'
  },
  itemPrice: {
    fontSize: 14,
    color: '#555',
    textAlign:'right'

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
    left: 10,
    top:20
  },
  deleteIcon: {
    fontSize: 20,
    color: '#e9a1a1',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    // marginVertical: 20,
    // right:12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    backgroundColor: '#e9a1a1',
    borderRadius: 5,
  },
  buttonIcon: {
    fontSize: 16,
    color: '#fff',
    marginRight: 10,
    fontWeight:'bold'
  },
  buttonText: {
    fontSize: 13,
    color: '#fff',
    fontWeight:'500'
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
    backgroundColor:'white',
    width:'100%',
    height:40
  },
  totalText: {
    fontSize: 22,
    fontWeight: 'bold',
    alignItems:'center',
    marginTop:4
  },
});

export default ShoppingList;
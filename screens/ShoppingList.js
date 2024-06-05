import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import firebase, { firestore, auth, fieldValue } from './../firebase';

const ShoppingList = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { supermarketName, listName } = route.params || {};
  const [shoppingList, setShoppingList] = useState([]);
  const [listNameState, setListNameState] = useState(listName);
  const [loading, setLoading] = useState(true);
  const [shareEmail, setShareEmail] = useState('');
  const [isSharedList, setIsSharedList] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const userId = auth.currentUser.uid;

        // Check if the user owns the list or it's a shared list
        const listDocRef = firestore
          .collection('users')
          .doc(userId)
          .collection('shoppingLists')
          .doc(supermarketName)
          .collection('lists')
          .doc(listName);

        const unsubscribe = listDocRef.onSnapshot(async (doc) => {
          if (doc.exists) {
            const { items, listName: fetchedListName } = doc.data();
            setShoppingList(items || []);
            setListNameState(fetchedListName || listName);
            setIsSharedList(false);
          } else {
            const sharedListRef = firestore.collection('sharedLists').doc(listName);
            const sharedDoc = await sharedListRef.get();
            if (sharedDoc.exists) {
              const { items, listName: fetchedListName, sharedWith } = sharedDoc.data();
              const userId = auth.currentUser.uid;
              if (sharedWith.includes(userId)) {
                setShoppingList(items || []);
                setListNameState(fetchedListName || listName);
                setIsSharedList(true);
              } else {
                Alert.alert('Error', 'You do not have access to this list.');
                navigation.goBack();
              }
            } else {
              Alert.alert('Error', 'Document does not exist!');
              navigation.goBack();
            }
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching items:', error);
        setLoading(false);
      }
    };

    fetchItems();
  }, [route.params]);

  const updateList = async (updatedList) => {
    try {
      if (isSharedList) {
        const sharedListRef = firestore.collection('sharedLists').doc(listNameState);
        await sharedListRef.update({ items: updatedList });
      } else {
        const userId = auth.currentUser.uid;
        const userRef = firestore.doc(`users/${userId}`);
        await userRef
          .collection('shoppingLists')
          .doc(supermarketName)
          .collection('lists')
          .doc(listNameState)
          .update({ items: updatedList });
      }
    } catch (error) {
      console.error('Error updating list:', error);
      Alert.alert('Error', 'Failed to update list. Please try again later.');
    }
  };

  const shareList = async () => {
    if (!shareEmail) {
      Alert.alert('Error', 'Please enter an email to share the list with.');
      return;
    }

    try {
      const userSnapshot = await firestore.collection('users').where('email', '==', shareEmail).get();
      if (!userSnapshot.empty) {
        const shareUserId = userSnapshot.docs[0].id;
        const currentUser = auth.currentUser.uid;
        const sharedListRef = firestore.collection('sharedLists').doc(listName);

        // Check if the document exists
        const doc = await sharedListRef.get();
        if (doc.exists) {
          // If it exists, update the document
          await sharedListRef.update({
            sharedWith: fieldValue.arrayUnion(shareUserId),
            items: shoppingList, // Ensure items are included in the update
            sharedBy: currentUser // Include the user who shared the list
          });
        } else {
          // If it does not exist, create the document
          await sharedListRef.set({
            sharedWith: [shareUserId],
            items: shoppingList,
            listName: listNameState,
            supermarketName, // Ensure supermarketName is included in the creation
            sharedBy: currentUser // Include the user who shared the list
          });
        }

        // Add reference to the shared list in the shared user's document
        await firestore.collection('users').doc(shareUserId).update({
          receivedLists: fieldValue.arrayUnion({ listName, supermarketName })
        });

        // Add reference to the shared list in the current user's document
        await firestore.collection('users').doc(currentUser).update({
          sharedLists: fieldValue.arrayUnion({ listName, supermarketName })
        });

        Alert.alert('Success', 'List shared successfully.');
        setShareEmail('');
      } else {
        Alert.alert('Error', 'User not found.');
      }
    } catch (error) {
      console.error('Error sharing list:', error);
      Alert.alert('Error', 'Failed to share list. Please try again later.');
    }
  };

  const totalPrice = shoppingList.reduce((acc, item) => acc + (parseFloat(item.ItemPrice) * (item.quantity || 1)), 0);

  const renderItem = ({ item, index }) => (
    <View style={styles.item}>
      <Text style={styles.itemName}>{item.ItemName}</Text>
      <Text style={styles.ItemCode}>קוד המוצר: {item.ItemCode}</Text>
      <Text style={styles.ItemCode}>מחיר: {item.ItemPrice}</Text>
      <Text style={styles.itemPrice}> {item.UnitOfMeasurePrice} ₪ ל {item.UnitOfMeasure}</Text>
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
      const updatedList = shoppingList.filter(item => item.id !== itemToDelete.id);
      setShoppingList(updatedList);
      await updateList(updatedList);
      Alert.alert('בוצע', 'פריט נמחק בהצלחה.');
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('שגיאה', 'מחיקת הפריט נכשלה. בבקשה נסה שוב מאוחר יותר.');
    }
  };

  const updateQuantity = async (index, text) => {
    const updatedList = [...shoppingList];
    updatedList[index].quantity = text;
    setShoppingList(updatedList);
    await updateList(updatedList);
  };

  const clearAllItems = () => {
    Alert.alert(
      'נקה את כל הפריטים',
      'האם את/ה בטוח/ה שאת/ה רוצה למחוק את כל הפריטים מהרשימה?',
      [
        { text: 'בטל', style: 'cancel' },
        { text: 'אשור', onPress: () => handleClearAllItems() },
      ],
      { cancelable: false }
    );
  };

  const handleClearAllItems = async () => {
    try {
      setShoppingList([]);
      await updateList([]);
      Alert.alert('בוצע', 'כל הפריטים נוקו בהצלחה.');
    } catch (error) {
      console.error('Error clearing items:', error);
      Alert.alert('שגיאה', 'נכשל בניקוי הפריטים. בבקשה נסה שוב מאוחר יותר.');
    }
  };

  const saveShoppingList = async () => {
    try {
      await updateList(shoppingList);
      Alert.alert('בוצע', 'רשימת הקניות עודכנה בהצלחה.');
    } catch (error) {
      console.error('Error saving shopping list:', error);
      Alert.alert('שגיאה', 'עדכון רשימת הקניות נכשל. בבקשה נסה שוב מאוחר יותר.');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#e9a1a1" />
      ) : (
        <>
          <Text style={styles.title}>{listNameState}</Text>
          <FlatList
            data={shoppingList}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
          />
          <TouchableOpacity onPress={() => navigation.navigate('ListItems', { supermarketName, listName:listNameState })} style={styles.backButton}>
            <FontAwesome name="arrow-left" style={styles.backIcon} />
            <Text style={styles.backText}>חזור לרשימת המוצרים</Text>
          </TouchableOpacity>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>סה"כ: {totalPrice.toFixed(2)} ₪</Text>
          </View>

          <View style={styles.shareContainer}>
            <TextInput
              style={styles.shareInput}
              placeholder="הזן אימייל לשיתוף"
              value={shareEmail}
              onChangeText={setShareEmail}
            />
            
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={clearAllItems} style={styles.button}>
              <FontAwesome name="trash" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>מחק את הכל</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={shareList}>
              <FontAwesome name="share" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>שתף את הרשימה</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={saveShoppingList} style={styles.button}>
              <FontAwesome name="save" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>שמור שינויים</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddFamilyMember')}>
              <FontAwesome name="users" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>הוסף בן משפחה</Text>
            </TouchableOpacity> */}
          </View>
        </>
      )}
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
    paddingHorizontal:1
  },
  buttonIcon: {
    fontSize: 18,
    color: '#fff',
    marginRight: 5,
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
    // padding: 5,
    // marginTop: 10,
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
  shareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 20,
    padding:5
  },
  shareInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 3,
    borderRadius: 5,
  },
});

export default ShoppingList;
import React, { useState, useEffect } from 'react';
import { Image, View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import firebase, { firestore, auth, fieldValue } from './../firebase';
import RNPickerSelect from 'react-native-picker-select';

const ShoppingList = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { supermarketName, listName } = route.params || {};
  const [shoppingList, setShoppingList] = useState([]);
  const [listNameState, setListNameState] = useState(listName);
  const [loading, setLoading] = useState(true);
  const [shareEmail, setShareEmail] = useState('');
  const [isSharedList, setIsSharedList] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState('');

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
              if (sharedWith.includes(userId)) {
                setShoppingList(items || []);
                setListNameState(fetchedListName || listName);
                setIsSharedList(true);
              } else {
                Alert.alert('שגיאה', 'אין לך גישה לרשימה זו.');
                navigation.goBack();
              }
            } else {
              Alert.alert('שגיאה', 'המסמך לא קיים!');
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

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = firestore.collection('users').doc(currentUser.uid);
        const userData = (await userRef.get()).data();
        const family = userData.family || [];
        const familyMemberPromises = family.map(async memberId => {
          const memberData = (await firestore.collection('users').doc(memberId).get()).data();
          return { id: memberId, email: memberData.email };
        });
        const familyMembersData = await Promise.all(familyMemberPromises);
        setFamilyMembers(familyMembersData);
      }
    };
    fetchFamilyMembers();
  }, []);

  const updateList = async (updatedList) => {
    try {
      const userId = auth.currentUser.uid;
      let listRef;

      if (isSharedList) {
        // Update the shared list
        listRef = firestore.collection('sharedLists').doc(listNameState);
        await listRef.update({ items: updatedList });

        // Propagate updates to collaborators' received lists
        const sharedDoc = await listRef.get();
        const sharedData = sharedDoc.data();
        for (const sharedUserId of sharedData.sharedWith) {
          if (sharedUserId !== userId) {
            const sharedUserRef = firestore.collection('users').doc(sharedUserId);
            const sharedUserDoc = await sharedUserRef.get();
            const sharedUserData = sharedUserDoc.data();
            const updatedReceivedLists = sharedUserData.receivedLists.map((list) => {
              if (list.listName === listNameState && list.supermarketName === supermarketName) {
                return { ...list, items: updatedList };
              }
              return list;
            });
            await sharedUserRef.update({ receivedLists: updatedReceivedLists });
          }
        }
      } else {
        // Update the user's personal list
        listRef = firestore
          .collection('users')
          .doc(userId)
          .collection('shoppingLists')
          .doc(supermarketName)
          .collection('lists')
          .doc(listNameState);
        await listRef.update({ items: updatedList });
      }
    } catch (error) {
      console.error('שגיאה בעדכון הרשימה:', error);
      Alert.alert('שגיאה', 'עדכון הרשימה נכשל. בבקשה נסה שוב מאוחר יותר.');
    }
  };

  const deleteList = async () => {
    try {
      const userId = auth.currentUser.uid;
      let listRef;

      if (isSharedList) {
        listRef = firestore.collection('sharedLists').doc(listNameState);
        await listRef.delete();

        // Propagate deletion to collaborators' received lists
        const sharedDoc = await listRef.get();
        const sharedData = sharedDoc.data();
        for (const sharedUserId of sharedData.sharedWith) {
          if (sharedUserId !== userId) {
            const sharedUserRef = firestore.collection('users').doc(sharedUserId);
            await sharedUserRef.update({
              receivedLists: fieldValue.arrayRemove({ listName: listNameState, supermarketName })
            });
          }
        }
      } else {
        listRef = firestore
          .collection('users')
          .doc(userId)
          .collection('shoppingLists')
          .doc(supermarketName)
          .collection('lists')
          .doc(listNameState);
        await listRef.delete();
      }
      Alert.alert('בוצע', 'הרשימה נמחקה בהצלחה.');
      navigation.goBack();
    } catch (error) {
      console.error('שגיאה במחיקת הרשימה:', error);
      Alert.alert('שגיאה', 'מחיקת הרשימה נכשלה. בבקשה נסה שוב מאוחר יותר.');
    }
  };

  const shareList = async () => {
    if (!selectedFamilyMember) {
      Alert.alert('שגיאה', 'אנא בחר בן משפחה לשתף איתו את הרשימה.');
      return;
    }

    try {
      const currentUser = auth.currentUser.uid;
      const sharedListRef = firestore.collection('sharedLists').doc(listNameState);
      const doc = await sharedListRef.get();
      if (doc.exists) {
        await sharedListRef.update({
          sharedWith: fieldValue.arrayUnion(selectedFamilyMember),
          items: shoppingList,
          sharedBy: currentUser
        });
      } else {
        await sharedListRef.set({
          sharedWith: [selectedFamilyMember],
          items: shoppingList,
          listName: listNameState,
          supermarketName,
          sharedBy: currentUser
        });
      }
      await firestore.collection('users').doc(selectedFamilyMember).update({
        receivedLists: fieldValue.arrayUnion({ listName: listNameState, supermarketName })
      });
      await firestore.collection('users').doc(currentUser).update({
        sharedLists: fieldValue.arrayUnion({ listName: listNameState, supermarketName })
      });
      Alert.alert('בוצע', 'הרשימה שותפה בהצלחה.');
      setShareEmail('');
    } catch (error) {
      console.error('שגיאה בשיתוף רשימת:', error);
      Alert.alert('שגיאה', 'נכשל בשיתוף הרשימה. בבקשה נסה שוב מאוחר יותר.');
    }
  };

  const totalPrice = shoppingList.reduce((acc, item) => acc + (parseFloat(item.ItemPrice) * (item.quantity || 1)), 0);

  const renderItem = ({ item, index }) => (
    <View style={styles.item}>
      <View>
        <Text style={styles.itemName}>{item.ItemName}</Text>
        <Text style={styles.ItemCode}>קוד המוצר: {item.ItemCode}</Text>
        <Text style={styles.ItemCode}>מחיר: {item.ItemPrice}</Text>
        <Text style={styles.itemPrice}>{item.UnitOfMeasurePrice} ₪ ל {item.UnitOfMeasure}</Text>
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
      <Image source={{ uri: item.imageUrl || ('https://blog.greendot.org/wp-content/uploads/sites/13/2021/09/placeholder-image.png') }} style={styles.itemImage} />
    </View>
  );

  const deleteItem = async (itemToDelete) => {
    try {
      const updatedList = shoppingList.filter((item) => item.id !== itemToDelete.id);
      setShoppingList(updatedList);
      await updateList(updatedList);
      Alert.alert('בוצע', 'פריט נמחק בהצלחה.');
    } catch (error) {
      console.error('שגיאה במחיקת פריט:', error);
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
      console.error('שגיאה בניקוי פריטים:', error);
      Alert.alert('שגיאה', 'נכשל בניקוי הפריטים. בבקשה נסה שוב מאוחר יותר.');
    }
  };

  const saveShoppingList = async () => {
    try {
      await updateList(shoppingList);
      Alert.alert('בוצע', 'רשימת הקניות עודכנה בהצלחה.');
    } catch (error) {
      console.error('שגיאה בשמירת רשימת הקניות:', error);
      Alert.alert('שגיאה', 'עדכון רשימת הקניות נכשל. בבקשה נסה שוב מאוחר יותר.');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#e9a1a1" />
      ) : (
        <>
            <TouchableOpacity onPress={() => navigation.navigate('ListItems', { supermarketName, listName: listNameState })} style={styles.backButton}>
              <FontAwesome name="arrow-left" style={styles.backIcon} />
              <Text style={styles.backText} >חזור לרשימת המוצרים</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{listNameState}</Text>
          <FlatList
            data={shoppingList}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>סה"כ: {totalPrice.toFixed(2)} ₪</Text>
          </View>

          <View style={styles.shareContainer}>
            <RNPickerSelect
              onValueChange={(value) => setSelectedFamilyMember(value)}
              items={familyMembers.map(member => ({
                label: member.email,
                value: member.id,
                key: member.id
              }))}
              placeholder={{ label: "בחר בן משפחה לשתף איתו את הרשימה", value: null }}
              style={pickerSelectStyles}
            />
          </View>
          {selectedFamilyMember ? (
            <TouchableOpacity style={styles.button} onPress={shareList}>
              <FontAwesome name="share" style={styles.shareBtn} />
              <Text style={styles.buttonText}>שתף את הרשימה</Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={clearAllItems} style={styles.button}>
              <FontAwesome name="trash" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>מחק את הכל</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity onPress={deleteList} style={styles.button}>
              <FontAwesome name="trash-o" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>מחק את הרשימה</Text>
            </TouchableOpacity> */}

            <TouchableOpacity onPress={() => navigation.navigate('CompareSupermarkets', { shoppingList, supermarketName, listName })} style={styles.button}>
              <FontAwesome name="balance-scale" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>השווה סופרמרקטים</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={saveShoppingList} style={styles.button}>
              <FontAwesome name="save" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>שמור שינויים</Text>
              </TouchableOpacity> */}
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddFamilyMember')}>
              <FontAwesome name="users" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>הוסף בן משפחה</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};




const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e9a1a1',
    borderRadius: 4,
    color: '#e9a1a1',
    paddingRight: 30,
    backgroundColor: '#fff',
    textAlign: 'center'
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e9a1a1',
    borderRadius: 4,
    color: '#e9a1a1',
    paddingRight: 30,
    backgroundColor: '#fff',
    textAlign: 'center'

  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 16,
  },
  roww: {
    // flexDirection: 'row',
    // paddingHorizontal: 120,
    // marginHorizontal:50
  },
  item: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    marginBottom: 10,
  },
  itemImage: {
    height: 90,
    paddingRight: 75,
    left: 85
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    left: 70
  },
  ItemCode: {
    fontSize: 14,
    color: '#555',
    textAlign: 'right',
    left: 70

  },
  itemPrice: {
    fontSize: 14,
    color: '#555',
    textAlign: 'right',
    left: 70

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
    top: 20
  },
  deleteIcon: {
    fontSize: 20,
    color: '#e9a1a1',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
    backgroundColor: '#e9a1a1',
    borderRadius: 10,
    marginBottom: 4
  },
  buttonIcon: {
    fontSize: 15,
    color: '#fff',
    marginRight: 5,
  },
  buttonText: {
    fontSize: 13,
    color: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    left:120,
    marginTop:50
  },
  backIcon: {
    fontSize: 20,
    color: '#e9a1a1',
    right: 120
  },
  backText: {
    fontSize: 12,
    color: '#e9a1a1',
    right: 115,
    textAlign:'right',
  },
  totalContainer: {
    alignItems: 'center',
    marginVertical: 5,
    backgroundColor: 'white',
    width: '100%',
    height: 40
  },
  totalText: {
    fontSize: 22,
    fontWeight: 'bold',
    alignItems: 'center',
    marginTop: 4
  },
  shareContainer: {
    color: '#e9a1a1',
    // backgroundColor:'#e9a1a1',
    padding: 5,
    marginBottom: 5
  },
  shareBtn: {
    fontSize: 18,
    color: '#fff',
    marginRight: 5,
    fontWeight: 'bold',
    paddingHorizontal: 110,
    right: 100,
    paddingBottom: 5
  },

});

export default ShoppingList;
import React, { useState, useEffect } from 'react';
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator, Modal, Switch } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { auth, firestore, fieldValue } from './../firebase';
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
  const [shareWithAll, setShareWithAll] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [lastModifiedBy, setLastModifiedBy] = useState('');
  const [lastModifiedAt, setLastModifiedAt] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const userId = auth.currentUser.uid;
        const listDocRef = firestore
          .collection('users')
          .doc(userId)
          .collection('shoppingLists')
          .doc(supermarketName)
          .collection('lists')
          .doc(listName);

        const unsubscribe = listDocRef.onSnapshot(async (doc) => {
          if (doc.exists) {
            const { items, listName: fetchedListName, lastModifiedBy, lastModifiedAt } = doc.data();
            setShoppingList(items || []);
            setListNameState(fetchedListName || listName);
            setLastModifiedBy(lastModifiedBy || '');
            setLastModifiedAt(lastModifiedAt ? lastModifiedAt.toDate() : null);
            setIsSharedList(false);
          } else {
            const sharedListRef = firestore.collection('sharedLists').doc(listName);
            const sharedUnsubscribe = sharedListRef.onSnapshot(async (sharedDoc) => {
              if (sharedDoc.exists) {
                const { items, listName: fetchedListName, sharedWith, lastModifiedBy, lastModifiedAt } = sharedDoc.data();
                if (sharedWith.some(member => member.id === userId)) {
                  setShoppingList(items || []);
                  setListNameState(fetchedListName || listName);
                  setLastModifiedBy(lastModifiedBy || '');
                  setLastModifiedAt(lastModifiedAt ? lastModifiedAt.toDate() : null);
                  setIsSharedList(true);

                  // Update user's `shoppingLists` collection
                  const userListRef = firestore
                    .collection('users')
                    .doc(userId)
                    .collection('shoppingLists')
                    .doc(supermarketName)
                    .collection('lists')
                    .doc(listName);
                  await userListRef.set({ items, listName: fetchedListName, lastModifiedBy, lastModifiedAt }, { merge: true });
                } else {
                  Alert.alert('שגיאה', 'אין לך גישה לרשימה זו.');
                  navigation.goBack();
                }
              } else {
                Alert.alert('שגיאה', 'המסמך לא קיים!');
                navigation.goBack();
              }
            });

            return () => sharedUnsubscribe();
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

  const fetchFamilyMembers = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userRef = firestore.collection('users').doc(currentUser.uid);
      const userData = (await userRef.get()).data();
      const family = userData.family || [];
      const familyMemberPromises = family.map(async memberId => {
        const memberData = (await firestore.collection('users').doc(memberId).get()).data();
        return { id: memberId, displayName: memberData.displayName };
      });
      const familyMembersData = await Promise.all(familyMemberPromises);
      setFamilyMembers(familyMembersData);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchFamilyMembers();
    }, [])
  );

  const updateList = async (updatedList) => {
  try {
    const currentUser = auth.currentUser;
    const userDoc = await firestore.collection('users').doc(currentUser.uid).get();
    const displayName = userDoc.data().displayName;
    const timestamp = new Date();
    const uid =  currentUser.uid;
    const sharedListRef = firestore.collection('sharedLists').doc(listNameState);
    const sharedDoc = await sharedListRef.get();

    if (sharedDoc.exists) {
      // Update shared list
      await sharedListRef.update({
        items: updatedList,
        lastModifiedBy: displayName,
        lastModifiedAt: timestamp
      });

      // Sync the updated list with all users' private lists
      const sharedData = sharedDoc.data();
      const allUsers = [...sharedData.sharedWith, {id:uid}]; // Include the creator

      for (const user of allUsers) {
        const userRef = firestore.collection('users').doc(user.id);
        const supermarketRef = userRef.collection('shoppingLists').doc(supermarketName);
        const userListRef = supermarketRef.collection('lists').doc(listNameState);
        await userListRef.set({
          items: updatedList,
          lastModifiedBy: displayName,
          lastModifiedAt: timestamp
        }, { merge: true });
      }
    } else {
      // Update private list
      const userListRef = firestore
        .collection('users')
        .doc(currentUser.uid)
        .collection('shoppingLists')
        .doc(supermarketName)
        .collection('lists')
        .doc(listNameState);

      await userListRef.set({
        items: updatedList,
        lastModifiedBy: displayName,
        lastModifiedAt: timestamp
      }, { merge: true });
    }

  } catch (error) {
    console.error('שגיאה בעדכון הרשימה:', error);
    Alert.alert('שגיאה', 'עדכון הרשימה נכשל. בבקשה נסה שוב מאוחר יותר.');
  }
};


  const openItemModal = (item) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const closeItemModal = () => {
    setSelectedItem(null);
    setShowItemModal(false);
  };

  const deleteList = async () => {
    try {
      const userId = auth.currentUser.uid;
      let listRef;

      if (isSharedList) {
        listRef = firestore.collection('sharedLists').doc(listNameState);
        await listRef.delete();

        const sharedDoc = await listRef.get();
        const sharedData = sharedDoc.data();
        for (const sharedUserId of sharedData.sharedWith) {
          if (sharedUserId.id !== userId) {
            const sharedUserRef = firestore.collection('users').doc(sharedUserId.id);
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
    if (!selectedFamilyMember && !shareWithAll) {
      Alert.alert('שגיאה', 'אנא בחר בן משפחה לשתף איתו את הרשימה או שתף עם כולם.');
      return;
    }
  
    try {
      const currentUser = auth.currentUser;
      const userDoc = await firestore.collection('users').doc(currentUser.uid).get();
      const displayName = userDoc.data().displayName;
  
      let membersToShareWith = [];
      if (shareWithAll) {
        membersToShareWith = familyMembers.map(member => ({ id: member.id, displayName: member.displayName }));
      } else {
        const familyMemberDoc = await firestore.collection('users').doc(selectedFamilyMember).get();
        const familyMemberData = familyMemberDoc.data();
        membersToShareWith = [{ id: selectedFamilyMember, displayName: familyMemberData.displayName }];
      }
  
      const sharedListRef = firestore.collection('sharedLists').doc(listNameState);
      const doc = await sharedListRef.get();
      if (doc.exists) {
        await sharedListRef.update({
          sharedWith: fieldValue.arrayUnion(...membersToShareWith),
          items: shoppingList,
          sharedBy: displayName,
          lastModifiedBy: displayName,
          lastModifiedAt: new Date()
        });
      } else {
        await sharedListRef.set({
          sharedWith: membersToShareWith,
          items: shoppingList,
          listName: listNameState,
          supermarketName,
          sharedBy: displayName,
          lastModifiedBy: displayName,
          lastModifiedAt: new Date()
        });
      }
      for (const member of membersToShareWith) {
        await firestore.collection('users').doc(member.id).update({
          receivedLists: fieldValue.arrayUnion({ listName: listNameState, supermarketName, sharedBy: displayName })
        });
      }
      // Update the current user's received lists as well
      await firestore.collection('users').doc(currentUser.uid).update({
        sharedLists: fieldValue.arrayUnion({ listName: listNameState, supermarketName }),
        receivedLists: fieldValue.arrayUnion({ listName: listNameState, supermarketName, sharedBy: displayName })
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
    <TouchableOpacity onPress={() => openItemModal(item)} style={styles.item}>
      <View>
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
      <Image source={{ uri: item.imageUrl || 'https://blog.greendot.org/wp-content/uploads/sites/13/2021/09/placeholder-image.png' }} style={styles.itemImage} />
    </TouchableOpacity>
  );

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('he-IL', options);
  };

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
        { text: 'אישור', onPress: () => handleClearAllItems() },
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
            <Text style={styles.backText}>חזור לרשימת המוצרים</Text>
          </TouchableOpacity>
{/* 
          <TouchableOpacity onPress={saveShoppingList} style={styles.button}>
              <FontAwesome name="save" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>שמור</Text>
            </TouchableOpacity> */}

          <Text style={styles.title}>{listNameState}</Text>
          {lastModifiedBy && (
            <View style={styles.lastModifiedContainer}>
              <Text style={styles.lastModifiedText}>
                אחרון ששונה על ידי: {lastModifiedBy} בתאריך: {lastModifiedAt ? formatDate(lastModifiedAt) : ''}
              </Text>
            </View>
          )}
          <FlatList
            data={shoppingList}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
          />
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>סה"כ: {totalPrice.toFixed(2)} ₪</Text>
          </View>

          <View style={styles.shareContainer}>
            <View style={styles.switchContainer}>
              <Switch
                value={shareWithAll}
                onValueChange={(value) => setShareWithAll(value)}
              />
              <Text style={styles.switchLabel}>שתף עם כל המשפחה</Text>
            </View>
            {!shareWithAll && (
              <RNPickerSelect
                onValueChange={(value) => setSelectedFamilyMember(value)}
                items={familyMembers.map(member => ({
                  label: member.displayName,
                  value: member.id,
                  key: member.id
                }))}
                placeholder={{ label: "בחר בן משפחה לשתף איתו את הרשימה", value: null }}
                style={pickerSelectStyles}
              />
            )}
          </View>
          <TouchableOpacity style={styles.button} onPress={shareList}>
            <FontAwesome name="share" style={styles.shareBtn} />
            <Text style={styles.buttonText}>שתף את הרשימה</Text>
          </TouchableOpacity>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={clearAllItems} style={styles.button}>
              <FontAwesome name="trash" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>מחק את הכל</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('CompareSupermarkets', { shoppingList, supermarketName, listName })} style={styles.button}>
              <FontAwesome name="balance-scale" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>השווה סופרמרקטים</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddFamilyMember')}>
              <FontAwesome name="users" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>הוסף בן משפחה</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      <Modal
        visible={showItemModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeItemModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <Image source={{ uri: selectedItem.imageUrl || 'https://blog.greendot.org/wp-content/uploads/sites/13/2021/09/placeholder-image.png' }} style={styles.modalItemImage} />
                <Text style={styles.modalItemName}>{selectedItem.ItemName}</Text>
                <Text style={styles.modalItemCode}>קטגורי: {selectedItem.Category}</Text>
                <Text style={styles.modalItemPrice}>מחיר: {selectedItem.ItemPrice} ₪</Text>
                <Text style={styles.modalItemPrice}>{selectedItem.UnitOfMeasurePrice} ₪ ל {selectedItem.UnitOfMeasure}</Text>
                <Text style={styles.modalItemCode}>קוד מוצר: {selectedItem.ItemCode}</Text>
                <TouchableOpacity onPress={closeItemModal} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseButtonText}>סגור</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    marginBottom: 25,
    marginTop: 16,
    elevation: 2,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    marginBottom: 10,
  },
  itemImage: {
    height: 50,
    width: 50,
    alignSelf: 'center',
    left: 15
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    left: 60
  },
  ItemCode: {
    fontSize: 14,
    color: '#555',
    textAlign: 'right',
    left: 60
  },
  itemPrice: {
    fontSize: 14,
    color: '#555',
    textAlign: 'right',
    left: 60
  },
  modifiedBy: {
    fontSize: 12,
    color: '#555',
    textAlign: 'right',
    left: 60
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    right: 10
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
    left: 20,
  },
  deleteIcon: {
    fontSize: 20,
    color: '#e9a1a1',
    right: 20
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
    backgroundColor: '#e9a1a1',
    borderRadius: 5,
    marginBottom: 4,

  },
  buttonIcon: {
    fontSize: 13,
    color: '#fff',
    marginRight: 5,
  },
  buttonText: {
    fontSize: 12,
    color: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30
  },
  backIcon: {
    fontSize: 20,
    color: '#e9a1a1',
    marginRight: 10
  },
  backText: {
    fontSize: 14,
    color: '#e9a1a1',
    textAlign: 'center',
  },
  totalContainer: {
    alignItems: 'center',
    marginVertical: 7,
    backgroundColor: 'white',
    width: '100%',
    height: 40,
    justifyContent: 'center',
    borderRadius: 5,
  },
  totalText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  shareContainer: {
    color: '#e9a1a1',
    padding: 5,
    marginBottom: 5,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  switchLabel: {
    fontSize: 15,
    color: '#e9a1a1',
  },
  shareBtn: {
    fontSize: 18,
    color: '#fff',
    marginRight: 5,
    fontWeight: 'bold',
    paddingHorizontal: 110,
    right: 100,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right'
  },
  modalItemPrice: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    textAlign: 'right'

  },
  modalItemCode: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    textAlign: 'right'

  },
  modalItemImage: {
    height: 100,
    width: 100,
    marginBottom: 20,
    alignSelf: 'stretch'
  },
  modalCloseButton: {
    padding: 10,
    backgroundColor: '#e9a1a1',
    borderRadius: 5,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center'

  },
  lastModifiedContainer: {
    padding: 5,
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    alignItems: 'center',
  },
  lastModifiedText: {
    fontSize: 12,
    color: '#555',
    fontStyle: 'italic',
    marginBottom: 5
  },
});

export default ShoppingList;


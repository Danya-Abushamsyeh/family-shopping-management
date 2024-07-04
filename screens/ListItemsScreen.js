import React, { useState, useEffect } from 'react';
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator, Modal } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { auth, firestore, database } from './../firebase';
import { getItemsBySupermarket } from './../firebase';
import CustomPrompt from './../CustomModal/CustomPrompt';

const ListItemsScreen = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { supermarketName, listName: selectedListName } = route.params || {};
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [shoppingList, setShoppingList] = useState([]);
  const [listName, setListName] = useState(selectedListName);
  const [isModalVisible, setIsModalVisible] = useState(!selectedListName);
  const [loading, setLoading] = useState(true);
  const [isSharedList, setIsSharedList] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      const itemsData = await getItemsBySupermarket(supermarketName);
      setItems(itemsData);
      setLoading(false);
      extractCategories(itemsData);
    };
    fetchItems();
  }, [supermarketName, isFocused]);

  const extractCategories = (items) => {
    const uniqueCategories = [...new Set(items.map(item => item.Category || 'אחר'))];
    setCategories(uniqueCategories);
  };

  const createList = async (name) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userRef = firestore.collection('users').doc(currentUser.uid);
      const supermarketRef = userRef.collection('shoppingLists').doc(supermarketName);
      const listRef = supermarketRef.collection('lists').doc(name);

      await listRef.set({ listName: name, items: [] }, { merge: true });
    }
  };

  const filteredItems = items.filter(item =>
    (item.ItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ItemCode.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedCategory === '' || item.Category === selectedCategory)
  );

  const addToShoppingList = async (item) => {
    const currentUser = auth.currentUser;
    if (currentUser && selectedListName) {
      let listRef;
      let updatedList = [];
      let sharedListRef;
  
      if (isSharedList) {
        sharedListRef = firestore.collection('sharedLists').doc(selectedListName);
      } else {
        const userRef = firestore.collection('users').doc(currentUser.uid);
        const supermarketRef = userRef.collection('shoppingLists').doc(supermarketName);
        listRef = supermarketRef.collection('lists').doc(selectedListName);
      }
  
      const listSnapshot = isSharedList ? await sharedListRef.get() : await listRef.get();
      if (listSnapshot.exists) {
        updatedList = listSnapshot.data().items || [];
        const existingItem = updatedList.find(i => i.ItemCode === item.ItemCode);
        if (existingItem) {
          updatedList = updatedList.map(i =>
            i.ItemCode === item.ItemCode ? { ...i, quantity: (i.quantity || 1) + 1, modifiedBy: currentUser.displayName } : i
          );
        } else {
          updatedList.push({ ...item, quantity: 1, modifiedBy: currentUser.displayName });
        }
  
        if (isSharedList) {
          await sharedListRef.update({ items: updatedList });
  
          // Update in users' `shoppingLists` collection
          const sharedDoc = await sharedListRef.get();
          const sharedData = sharedDoc.data();
          for (const sharedUserId of sharedData.sharedWith) {
            const sharedUserRef = firestore.collection('users').doc(sharedUserId.id);
            const supermarketRef = sharedUserRef.collection('shoppingLists').doc(supermarketName);
            const userListRef = supermarketRef.collection('lists').doc(selectedListName);
            await userListRef.set({ items: updatedList }, { merge: true });
          }
        } else {
          await listRef.update({ items: updatedList });
  
          // Ensure the update is reflected in the sharedLists collection if the list is shared
          const sharedListRef = firestore.collection('sharedLists').doc(selectedListName);
          await sharedListRef.update({ items: updatedList });
        }
        setShoppingList(updatedList);
      } else {
        Alert.alert('שגיאה', 'רשימה זו אינה קיימת.');
      }
    } else {
      Alert.alert('שגיאה', 'שם רשימת הקניות לא הוגדר. בבקשה נסה שוב.');
    }
  };
  
  const comparePrices = (item) => {
    navigation.navigate('ComparePrices', { itemCode: item.ItemCode, itemName: item.ItemName, supermarketName });
  };

  const renderSupermarketItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.col}>
        <TouchableOpacity onPress={() => addToShoppingList(item)}>
          <FontAwesome name='plus' size={22} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => comparePrices(item)} style={styles.compareButton}>
          <Image source={require('./../assets/images/comper.png')} style={{ width: 25, height: 25 }} />
        </TouchableOpacity>
      </View>
      <View style={styles.texttext}>
        <Text style={styles.itemName}>{item.ItemName}</Text>
        <Text style={styles.ItemCode}>קוד המוצר: {item.ItemCode}</Text>
        <Text style={styles.itemPrice}>מחיר: {item.ItemPrice}</Text>
      </View>
      <Image source={{ uri: item.imageUrl || ('https://blog.greendot.org/wp-content/uploads/sites/13/2021/09/placeholder-image.png') }} style={styles.itemImage} />

    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.navItem} onPress={() => setShowCategoriesModal(true)}>
            <FontAwesome name='bars' size={24} color={'#fff'} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.searchButton} onPress={() => setSearchQuery('')}>
            <FontAwesome name='search' />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="חפש מוצר..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('בית')}>
          <Image source={require('./../assets/images/Image.jpg')} style={styles.logo} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.listButton} onPress={() => navigation.navigate('SupermarketLists', { supermarketName })}>
        <FontAwesome name="list" size={24} color="white" style={styles.listIcon} />
        <Text style={styles.listButtonText}>בחר לאיזו רשימה תוסיף או צור רשימה חדשה</Text>
      </TouchableOpacity>

      {/* <Text style={styles.supermarketName}>רשימת המוצרים</Text> */}
      <Text></Text>

      {loading ? (
        <ActivityIndicator size="large" color="#e9a1a1" />
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderSupermarketItem}
          keyExtractor={item => item.id.toString()}
        />
      )}
      <TouchableOpacity onPress={() => navigation.navigate('ShoppingList', { supermarketName, listName: selectedListName })} style={styles.backButton}>
        <Text style={styles.backText}> הרשימה שלי </Text>
        <FontAwesome name="shopping-basket" style={styles.backIcon} />
      </TouchableOpacity>

      <Modal
        visible={showCategoriesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoriesModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>קטגוריות</Text>
            <FlatList
              data={categories}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCategory(item);
                    setShowCategoriesModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setSelectedCategory('');
                setShowCategoriesModal(false);
              }}
            >
              <Text style={styles.modalItemText}>הצג את כל המוצרים</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 20,
    marginTop: 39
  },
  logoContainer: {
    height: 90,
    paddingVertical: 5,
    backgroundColor: '#e9a1a1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchContainer: {
    width: 230,
    height: 30,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginTop: 39
  },
  searchInput: {
    flex: 1,
    borderBottomWidth: 1,
    marginBottom: 5,
    textAlign: 'right',
    fontSize: 13
  },
  searchButton: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'right',
    right: 4
  },
  navItem: {
    marginLeft: 20,
    marginTop: 39
  },
  navigation: {
    flexDirection: 'row',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryButton: {
    backgroundColor: '#e9a1a1',
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  categoryText: {
    color: 'white',
  },
  supermarketName: {
    marginTop: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#464444',
    fontSize: 22
  },
  itemContainer: {
    backgroundColor: '#fff',
    marginBottom: 10,
    elevation: 2,
    marginRight: 10,
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    left: 140,
    marginBottom:10,
    marginTop:10
  },
  backIcon: {
    fontSize: 20,
    color: '#e9a1a1',
    left: 120
  },
  backText: {
    fontSize: 16,
    color: '#e9a1a1',
    textAlign: 'right',
    left: 120,
  },
  texttext: {
    alignItems: 'stretch',
    right: 80,
  },
  col: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 100,
  },
  roww: {
    flexDirection: 'row',
  },
  itemImage: {
    height: 50,
    width: 50,
    right:10
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    left: 60,
  },
  ItemCode: {
    fontSize: 14,
    color: '#555',
    textAlign: 'right',
    left: 60,
  },
  itemPrice: {
    fontSize: 14,
    color: '#555',
    textAlign: 'right',
    left: 60,
  },
  listButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#e9a1a1',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 10,
    marginBottom: 6
  },
  listButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'right'
  },
  listIcon: {
    paddingHorizontal: 10,
  },
  createListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e9a1a1',
    borderRadius: 5,
    margin: 10
  },
  createListButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    paddingLeft: 190
  },
  compareButton: {
    marginLeft: 1,
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
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalItem: {
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
  },
});

export default ListItemsScreen;
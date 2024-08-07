import React, { useState, useEffect } from 'react';
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator, Modal } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { auth, firestore } from './../firebase';
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
  const [sortOption, setSortOption] = useState(''); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);

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

  const filteredItems = items
  .filter(item =>
    (item.ItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ItemCode.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedCategory === '' || item.Category === selectedCategory)
  )
  .sort((a, b) => {
    if (sortOption === 'name') {
      return a.ItemName.localeCompare(b.ItemName);
    } else if (sortOption === 'price') {
      return parseFloat(a.ItemPrice) - parseFloat(b.ItemPrice);
    }
    return 0;
  });
 
  const sortedItems = filteredItems.sort((a, b) => {
    switch (sortOption) {
      case 'name':
        return a.ItemName.localeCompare(b.ItemName);
      case 'price':
        return parseFloat(a.ItemPrice) - parseFloat(b.ItemPrice);
      case 'relevance':
      default:
        return b.relevance - a.relevance;
    }
  });

  const handleSort = (option) => {
    setSortOption(option);
  };

  const clearSort = () => {
    setSortOption('');
  };

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
            i.ItemCode === item.ItemCode ? { ...i, quantity: (i.quantity || 1) + 1} : i
          );
        } else {
          updatedList.push({ ...item, quantity: 1 });
        }
  
        if (isSharedList) {
          await sharedListRef.update({ items: updatedList });
  
          const sharedDoc = await sharedListRef.get();
          const sharedData = sharedDoc.data();
          const allUsers = [...sharedData.sharedWith, { id: sharedData.sharedBy }]; // Include the creator
  
          for (const sharedUser of allUsers) {
            const sharedUserRef = firestore.collection('users').doc(sharedUser.id);
            const supermarketRef = sharedUserRef.collection('shoppingLists').doc(supermarketName);
            const userListRef = supermarketRef.collection('lists').doc(selectedListName);
            await userListRef.set({ items: updatedList }, { merge: true });
          }
        } else {
          await listRef.update({ items: updatedList });
  
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

  const openItemModal = (item) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };
  
  const closeItemModal = () => {
    setSelectedItem(null);
    setShowItemModal(false);
  };

  const renderSupermarketItem = ({ item }) => (
    <TouchableOpacity onPress={() => openItemModal(item)} style={styles.item}>
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
        <Text style={styles.itemPrice}>מחיר: {item.ItemPrice} ₪</Text>
      </View>
      <Image source={{ uri: item.imageUrl || ('https://blog.greendot.org/wp-content/uploads/sites/13/2021/09/placeholder-image.png') }} style={styles.itemImage} />
    </View>
    </TouchableOpacity>

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

      <View style={styles.sortContainer}>

       <TouchableOpacity style={styles.sortButton} onPress={() => handleSort('name')}>
          <Text style={styles.sortButtonText}>מיין לפי שם</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sortButton} onPress={() => handleSort('price')}>
          <Text style={styles.sortButtonText}>מיין לפי מחיר</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.sortButton } onPress={clearSort}>
          <Text style={styles.sortButtonText}>ניקוי מיון</Text>
        </TouchableOpacity>
  
      </View>

      <TouchableOpacity style={styles.listButton} onPress={() => navigation.navigate('SupermarketLists', { supermarketName })}>
        <FontAwesome name="list" size={24} color="white" style={styles.listIcon} />
        <Text style={styles.listButtonText}>בחר לאיזו רשימה תוסיף או צור רשימה חדשה</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#e9a1a1" />
      ) : (
        <FlatList
          data={sortedItems}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
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
  searchContainer: {
    width: 230,
    height: 30,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginTop: 39,
  },
  searchInput: {
    flex: 1,
    borderBottomWidth: 1,
    marginBottom: 5,
    textAlign: 'right',
    fontSize: 13,
  },
  searchButton: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'right',
    right: 4,
  },
  navItem: {
    marginLeft: 20,
    marginTop: 39,
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
    fontSize: 22,
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
    marginBottom: 10,
    marginTop: 10,
  },
  backIcon: {
    fontSize: 20,
    color: '#e9a1a1',
    left: 120,
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
    right: 10,
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
    marginHorizontal: 10,
    marginBottom: 6,
  },
  listButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'right',
    paddingLeft:4
  },
  listIcon: {
    paddingRight:5
  },
  createListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e9a1a1',
    borderRadius: 5,
    margin: 10,
  },
  createListButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    paddingLeft: 190,
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
    alignSelf:'center'
  },
  modalItem: {
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 10,
    right:5
  },
  sortButton: {
    padding :5,
    backgroundColor: '#e9a1a1',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  sortButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
    textAlign:'right'
  },
  modalItemPrice: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    textAlign:'right'

  },
  modalItemCode: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    textAlign:'right'

  },
  modalItemImage: {
    height: 100,
    width: 100,
    marginBottom: 20,
    alignSelf:'stretch'
  },
  modalCloseButton: {
    padding: 10,
    backgroundColor: '#e9a1a1',
    borderRadius: 5,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign:'center'

  },
});

export default ListItemsScreen;


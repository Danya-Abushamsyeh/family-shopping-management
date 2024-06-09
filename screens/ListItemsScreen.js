import React, { useState, useEffect } from 'react';
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator  } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { auth, firestore, database } from './../firebase';
import { getItemsBySupermarket, getItemsFromAllSupermarkets, searchItemAcrossSupermarkets } from './../firebase';
import CustomPrompt from './../CustomModal/CustomPrompt';

const ListItemsScreen = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { supermarketName, listName: selectedListName } = route.params|| {}; 
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [shoppingList, setShoppingList] = useState([]);
  const [listName, setListName] = useState(selectedListName);
  const [isModalVisible, setIsModalVisible] = useState(!selectedListName);
  const [loading, setLoading] = useState(true); // Add loading state
  
  useEffect(() => {
    const fetchItems = async () => {
      const itemsData = await getItemsBySupermarket(supermarketName);
      setItems(itemsData);
      setLoading(false);
    };
    fetchItems();
    // if (!listName) {
    //   setIsModalVisible(true);
    // }
  }, [supermarketName, isFocused]);  
  
  const handlePromptSubmit = async (name) => {
    if (name) {
      setListName(name);
      setIsModalVisible(false);
      await createList(name);
    } else {
      Alert.alert('שגיאה', 'שם רשימת הקניות לא יכול להיות ריק');
      // navigation.goBack();
    }
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
    item.ItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.ItemCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  
  const addToShoppingList = async (item) => {
    const currentUser = auth.currentUser;
    if (currentUser && selectedListName) {
      const userRef = firestore.collection('users').doc(currentUser.uid);
      const supermarketRef = userRef.collection('shoppingLists').doc(supermarketName);
      const listRef = supermarketRef.collection('lists').doc(selectedListName);
      const listSnapshot = await listRef.get();

      let updatedList;
      if (listSnapshot.exists) {
        updatedList = listSnapshot.data().items || [];
        const existingItem = updatedList.find(i => i.ItemCode === item.ItemCode);
        if (existingItem) {
          updatedList = updatedList.map(i =>
            i.ItemCode === item.ItemCode ? { ...i, quantity: (i.quantity || 1) + 1 } : i
          );
        } else {
          updatedList.push({ ...item, quantity: 1 });
        }
      } else { 
        // Create the list if it doesn't exist
        await createList(selectedListName);
        updatedList = [{ ...item, quantity: 1 }];
      }

      await listRef.set({ listName:selectedListName, items: updatedList }, { merge: true });
      setShoppingList(updatedList);
    } else {
      Alert.alert('שגיאה', 'שם רשימת הקניות לא הוגדר. בבקשה נסה שוב.');
    }
  };
  
  const comparePrices = (item) => {
    navigation.navigate('ComparePrices', { itemCode: item.ItemCode,itemName: item.ItemName });
  };  

  const renderSupermarketItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => addToShoppingList(item)}>
        <FontAwesome name='plus' size={22} color="gray" />
      </TouchableOpacity>

      <Text style={styles.itemName}>{item.ItemName}</Text>
      <Text style={styles.ItemCode}>קוד המוצר: {item.ItemCode}</Text>
      <Text style={styles.itemPrice}>מחיר: {item.ItemPrice}</Text>
      <TouchableOpacity onPress={() => comparePrices(item)} style={styles.compareButton}>
         <Image 
           source={require('./../assets/images/comper.png')} 
           style={{ width: 25, height: 25 }} 
         />      
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomPrompt
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handlePromptSubmit}
      />

      <View style={styles.logoContainer}>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.navItem} onPress={() => alert('בחר מהרשימה למטה או הקלד בחיפוש את שם המוצר שברצונך להוסיף לרשימה שלך')}>
            <Text>עזרה</Text>
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

      <TouchableOpacity style={styles.createListButton} onPress={() => setIsModalVisible(true)}>
        <FontAwesome name='plus' size={22} color="white" />
        <Text style={styles.createListButtonText}>ליצור רשימה חדשה</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ShoppingList', { supermarketName, listName:selectedListName })} style={styles.backButton}>
            <Text style={styles.backText}>חזור לרשימה שלי </Text>
            <FontAwesome name="arrow-right" style={styles.backIcon} />
      </TouchableOpacity>    

      <Text style={styles.supermarketName}>רשימת המוצרים</Text>
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

      <TouchableOpacity style={styles.listButton} onPress={() => navigation.navigate('SupermarketLists', { supermarketName })}>
        <FontAwesome name="list" size={24} color="white" style={styles.listIcon} />
        <Text style={styles.listButtonText}>הצג את הרשימות שלי</Text>
      </TouchableOpacity>
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
  supermarketsContainer: {
    marginTop: 20,
  },
  supermarketItem: {
    marginRight: 10,
    alignItems: 'center',
  },
  supermarketImage: {
    width: 230,
    height: 100,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 50
  },
  supermarketName: {
    marginTop: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#464444',
    fontSize: 18
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    // padding: 5,
    // marginTop: 10,
    left:125
  },
  backIcon: {
    fontSize: 20,
    color: '#e9a1a1',
    left: 120
  },
  backText: {
    fontSize: 16,
    color: '#e9a1a1',
    textAlign:'right',
    left: 110,
    // paddingHorizontal:8

  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'right',
    flexDirection:'row'
  },
  itemPrice: {
    color: '#888',
    fontSize: 14,
    textAlign: 'right'
  },
  ItemCode: {
    color: '#888',
    fontSize: 12,
    marginLeft: 50,
    textAlign: 'right'
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
    paddingHorizontal: 90,
    right: 85
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
    // marginLeft: 10,
    // paddingHorizontal:110
    paddingLeft:190
  },
  compareButton: {
    marginLeft: 1,
  },
});

export default ListItemsScreen;

// import React, { useState, useEffect } from 'react';
// import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator  } from 'react-native';
// import { useNavigation, useIsFocused } from '@react-navigation/native';
// import { FontAwesome } from '@expo/vector-icons';
// import { auth, firestore, database } from './../firebase';
// import { getItemsBySupermarket, getItemsFromAllSupermarkets, searchItemAcrossSupermarkets } from './../firebase';
// import CustomPrompt from './../CustomModal/CustomPrompt';

// const ListItemsScreen = ({ route }) => {
//   const navigation = useNavigation();
//   const isFocused = useIsFocused();
//   const { supermarketName, itemCode, itemName, listName: selectedListName } = route.params; // Destructure listName from params
//   const [items, setItems] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [shoppingList, setShoppingList] = useState([]);
//   const [listName, setListName] = useState(selectedListName);
//   const [isModalVisible, setIsModalVisible] = useState(!selectedListName);
//   const [loading, setLoading] = useState(true); // Add loading state

//   useEffect(() => {
//     const fetchItems = async () => {
//       const itemsData = await getItemsBySupermarket(supermarketName);
//       setItems(itemsData);
//       setLoading(false);
//     };
//     fetchItems();
//     // if (!listName) {
//     //   setIsModalVisible(true);
//     // }
//   }, [supermarketName, isFocused]);  
  
//   const handlePromptSubmit = async (name) => {
//     if (name) {
//       setListName(name);
//       setIsModalVisible(false);
//       await createList(name);
//     } else {
//       Alert.alert('שגיאה', 'שם רשימת הקניות לא יכול להיות ריק');
//       // navigation.goBack();
//     }
//   };

//   const createList = async (name) => {
//     const currentUser = auth.currentUser;
//     if (currentUser) {
//       const userRef = firestore.collection('users').doc(currentUser.uid);
//       const supermarketRef = userRef.collection('shoppingLists').doc(supermarketName);
//       const listRef = supermarketRef.collection('lists').doc(name);

//       await listRef.set({ listName: name, items: [] }, { merge: true });
//     }
//   };

//   const filteredItems = items.filter(item =>
//     item.ItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     item.ItemCode.toLowerCase().includes(searchQuery.toLowerCase())
//   );

  
//   const addToShoppingList = async (item) => {
//     const currentUser = auth.currentUser;
//     if (currentUser && selectedListName) {
//       const userRef = firestore.collection('users').doc(currentUser.uid);
//       const supermarketRef = userRef.collection('shoppingLists').doc(supermarketName);
//       const listRef = supermarketRef.collection('lists').doc(selectedListName);
//       const listSnapshot = await listRef.get();

//       let updatedList;
//       if (listSnapshot.exists) {
//         updatedList = listSnapshot.data().items || [];
//         const existingItem = updatedList.find(i => i.ItemCode === item.ItemCode);
//         if (existingItem) {
//           updatedList = updatedList.map(i =>
//             i.ItemCode === item.ItemCode ? { ...i, quantity: (i.quantity || 1) + 1 } : i
//           );
//         } else {
//           updatedList.push({ ...item, quantity: 1 });
//         }
//       } else { 
//         // Create the list if it doesn't exist
//         await createList(selectedListName);
//         updatedList = [{ ...item, quantity: 1 }];
//       }

//       await listRef.set({ items: updatedList }, { merge: true });
//       setShoppingList(updatedList);
//       Alert.alert('הפריט נוסף לרשימת הקניות');
//     } else {
//       Alert.alert('שגיאה', 'עליך לבחור שם לרשימה לפני הוספת פריטים');
//     }
//   };
  
//   const comparePrices = (item) => {
//     navigation.navigate('ComparePrices', { itemCode: item.ItemCode,itemName: item.ItemName });
//   }; 

//   const renderListItem = ({ item }) => (
//     <TouchableOpacity onPress={() => addToShoppingList(item)}>
//       <View style={styles.itemContainer}>
//         <Text style={styles.itemName}>{item.ItemName}</Text>
//         <Text style={styles.itemCode}>ברקוד: {item.ItemCode}</Text>
//         <TouchableOpacity onPress={() => comparePrices(item)} style={styles.compareButton}>
//          <Image 
//            source={require('./../assets/images/comper.png')} 
//            style={{ width: 25, height: 25 }} 
//          />      
//       </TouchableOpacity>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.logoContainer}>
//         <View style={styles.navigation}>
//           <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Supermarket')}>
//             <FontAwesome name="shopping-cart" style={styles.cartIcon} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.navItem} onPress={() => navigation.goBack()}>
//             <FontAwesome name="arrow-left" style={styles.backIcon} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.navItem} onPress={() => alert('בחר את הסופרמרקט אליו תלך או הקלד בחיפוש את שם המוצר שברצונך להוסיף לרשימה שלך')}>
//           </TouchableOpacity>
//         </View>
//         <Image source={require('./../assets/images/Image.jpg')} style={styles.logo} />
//       </View>
//       <Text style={styles.title}>רשימת המוצרים בסופרמרקט </Text>
//       <TextInput
//         style={styles.searchInput}
//         placeholder="חפש מוצר"
//         value={searchQuery}
//         onChangeText={setSearchQuery}
//       />
//       {loading ? ( 
//         <ActivityIndicator size="large" color="#e9a1a1" /> 
//       ) : ( 
//         <FlatList
//           data={filteredItems}
//           renderItem={renderListItem}
//           keyExtractor={item => item.ItemCode}
//         />
//       )}

//       {isModalVisible && (
//         <CustomPrompt
//           visible={isModalVisible}
//           title="הכנס שם לרשימת הקניות שלך"
//           placeholder="שם רשימת הקניות"
//           onCancel={() => navigation.goBack()}
//           onSubmit={handlePromptSubmit}
//         />
//       )}

//       <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//         <FontAwesome name="arrow-left" style={styles.backIcon} />
//         <Text style={styles.backText}>חזור לרשימת הסופרמרקטים</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   logo: {
//     width: 50,
//     height: 50,
//     marginRight: 20,
//     marginTop: 39,
//   },
//   logoContainer: {
//     height: 90,
//     paddingVertical: 5,
//     backgroundColor: '#e9a1a1',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   navigation: {
//     flexDirection: 'row',
//   },
//   navItem: {
//     marginLeft: 20,
//     marginTop: 39,
//   },
//   cartIcon: {
//     fontSize: 24,
//     color: '#fff',
//   },
//   backIcon: {
//     fontSize: 24,
//     color: '#e9a1a1',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   searchInput: {
//     height: 40,
//     borderColor: 'gray',
//     borderWidth: 1,
//     marginBottom: 10,
//     marginHorizontal: 20,
//     paddingHorizontal: 10,
//   },
//   itemContainer: {
//     backgroundColor: '#fff',
//     padding: 10,
//     marginBottom: 10,
//     borderRadius: 5,
//     elevation: 2,
//     marginRight: 30,
//     marginLeft: 30
//   },
//   itemName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     textAlign: 'right',
//   },
//   itemCode: {
//     fontSize: 16,
//     textAlign: 'right',
//   },
//   backButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   backText: {
//     fontSize: 16,
//     color: '#e9a1a1',
//   },
// });

// export default ListItemsScreen;

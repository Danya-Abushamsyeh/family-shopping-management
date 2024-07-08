import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth, firestore } from './../firebase';
import React, { useEffect, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import CustomPrompt from './../CustomModal/CustomPrompt';

const SupermarketListsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { supermarketName } = route.params;
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [listName, setListName] = useState('');

  useEffect(() => {
    fetchLists();
  }, [supermarketName]);

  const fetchLists = () => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      const userRef = firestore.collection('users').doc(currentUser.uid);

      const unsubscribe = userRef
        .collection('shoppingLists')
        .doc(supermarketName)
        .collection('lists')
        .onSnapshot((snapshot) => {
          const listsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setLists(listsData);
          setLoading(false);
        });

      return () => unsubscribe();
    }
  };

  const handleListPress = (listName) => {
    navigation.navigate('ShoppingList', { supermarketName, listName });
  };

  const handlePromptSubmit = async (name) => {
    if (name) {
      setListName(name);
      setIsModalVisible(false);
      await createList(name);
    } else {
      Alert.alert('שגיאה', 'שם רשימת הקניות לא יכול להיות ריק');
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

  const clearAllItems = (listNameToDelete) => {
    Alert.alert(
      'מחק את הרשימה',
      'האם אתה בטוח שאתה רוצה למחוק את הרשימה?',
      [
        { text: 'בטל', style: 'cancel' },
        { text: 'אשור', onPress: () => deleteList(listNameToDelete) },
      ],
      { cancelable: false }
    );
  };

  const deleteList = async (listNameToDelete) => {
    try {
      const userId = auth.currentUser.uid;
      const listRef = firestore
        .collection('users')
        .doc(userId)
        .collection('shoppingLists')
        .doc(supermarketName)
        .collection('lists')
        .doc(listNameToDelete);
      await listRef.delete();

      Alert.alert('בוצע', 'הרשימה נמחקה בהצלחה.');
      fetchLists(); // Refresh the list
    } catch (error) {
      console.error('שגיאה במחיקת הרשימה:', error);
      Alert.alert('שגיאה', 'מחיקת הרשימה נכשלה. בבקשה נסה שוב מאוחר יותר.');
    }
  };

  const renderListItem = ({ item }) => (
    <View style={styles.listItemContainer}>
      <TouchableOpacity onPress={() => clearAllItems(item.id)} style={styles.button}>
        <FontAwesome name="trash-o" style={styles.buttonIcon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.listItem} onPress={() => handleListPress(item.id)}>
        <Text style={styles.listName}>{item.listName}</Text>
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
      <Text style={styles.title}>{supermarketName} Lists</Text>
     
      {loading ? (
        <ActivityIndicator size="large" color="#e9a1a1" />
      ) : (
        <>
          {lists.length === 0 ? (
            <Text style={styles.noListsText}>אין רשימות</Text>
          ) : (
            <FlatList
              data={lists}
              renderItem={renderListItem}
              keyExtractor={(item) => item.id}
            />
          )}
        </>
      )}

      <TouchableOpacity style={styles.createListButton} onPress={() => setIsModalVisible(true)}>
        <FontAwesome name='cart-plus' size={22} color="white" />
        <Text style={styles.createListButtonText}>ליצור רשימה חדשה</Text>
      </TouchableOpacity>
      {/* <TouchableOpacity onPress={() => navigation.navigate('ListItems', { supermarketName })} style={styles.backButton}>
        <FontAwesome name="arrow-left" style={styles.backIcon} />
        <Text style={styles.backText}>חזור לרשימת המוצרים</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    marginTop: 51,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#464444',
  },
  noListsText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#635A5A',
  },
  listItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#e9a1a1',
    borderRadius: 5,
    marginBottom: 10,
  },
  listItem: {
    flex: 1,
  },
  listName: {
    fontSize: 18,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#635A5A',
  },
  button: {
    padding: 8,
  },
  buttonIcon: {
    fontSize: 15,
    color: '#fff',
  },
  createListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 11,
    backgroundColor: '#e9a1a1',
    borderRadius: 5,
    margin: 5,
  },
  createListButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  backIcon: {
    fontSize: 20,
    color: '#e9a1a1',
    marginRight: 10,
  },
  backText: {
    fontSize: 16,
    color: '#e9a1a1',
    fontWeight: 'bold',
  },
});

export default SupermarketListsScreen;

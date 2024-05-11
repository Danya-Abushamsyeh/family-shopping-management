// firebase.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/database';

const firebaseConfig = {
  apiKey: "AIzaSyCLBP1DtXiz-daQl1bHRnJXhd0t7W1m3Ww",
  authDomain: "todolist-84c80.firebaseapp.com",
  projectId: "todolist-84c80",
  storageBucket: "todolist-84c80.appspot.com",
  messagingSenderId: "268694599173",
  appId: "1:268694599173:web:741db0f89abc76a4b84e6c",
  measurementId: "G-H1ZH8VSTLF"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const createUserDocument = async (user, additionalData) => {
  if (!user) return;

  const userRef = firestore.doc(`users/${user.uid}`);
  const snapshot = await userRef.get();
  if (!snapshot.exists) {
    const { email, displayName } = user;
    const createdAt = new Date();

    try {
      await userRef.set({
        displayName,
        email,
        createdAt,
        ...additionalData,
      });
    } catch (error) {
      console.error('Error creating user document', error);
    }
  }

  return getUserDocument(user.uid);
};

// Function to get user document from Firestore
export const getUserDocument = async (uid) => {
  if (!uid) return null;

  try {
    const userDocument = await firestore.doc(`users/${uid}`).get();
    return { uid, ...userDocument.data() };
  } catch (error) {
    console.error('Error fetching user document', error);
    return null;
  }
};

export const getItemsBySupermarket = async (supermarket) => {
  try {
    const snapshot = await firebase.database().ref(`${supermarket}Items`).once('value');
    const itemsData = snapshot.val();
    // Convert the object of items into an array of items
    const itemsArray = Object.keys(itemsData).map((key) => ({
      id: key,
      ...itemsData[key],
    }));
    return itemsArray;
  } catch (error) {
    console.error('Error fetching items:', error);
    return []; // Return an empty array in case of error
  }
};

export const createShoppingList = async (userEmail, listName, items) => {
  try {
    const docRef = await firestore.collection('shoppingLists').doc(userEmail).collection('lists').add({
      listName,
      items,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating shopping list:', error);
    return null;
  }
};


export const deleteShoppingList = async (userEmail, listId) => {
  try {
    await firestore.collection('shoppingLists').doc(userEmail).collection('lists').doc(listId).delete();
    return true;
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    return false;
  }
};

export const updateShoppingList = async (userEmail, listId, newData) => {
  try {
    await firestore.collection('shoppingLists').doc(userEmail).collection('lists').doc(listId).update(newData);
    return true;
  } catch (error) {
    console.error('Error updating shopping list:', error);
    return false;
  }
};
export default firebase;

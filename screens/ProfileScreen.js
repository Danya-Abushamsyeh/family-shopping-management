import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import firebase, { auth, firestore, getUserDocument, createShoppingList, deleteShoppingList } from './../firebase';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocument = await getUserDocument(currentUser.uid);
        setUserData(userDocument);
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { userData });
  };

  const handleSignOut = async () => {
    try {
      await firebase.auth().signOut();
      navigation.navigate('Welcome');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleChooseImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access media library is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      await saveImageToStorage(result.uri);
    }
  };

  const saveImageToStorage = async (uri) => {
    try {
      const currentUser = auth.currentUser;
      
      // Convert the image URI to a Blob
      const blob = await getBlob(uri);

      const imageRef = firebase.storage().ref().child(`profile_photos/${currentUser.uid}`);
      await imageRef.put(blob);
      const downloadURL = await imageRef.getDownloadURL();

      // Update user's photoURL in Firebase Authentication
      await currentUser.updateProfile({ photoURL: downloadURL });

      // Update local user data
      setUserData({ ...userData, photoURL: downloadURL });
    } catch (error) {
      console.error('Error saving image to storage:', error);
      Alert.alert('Error', 'Failed to upload the image. Please try again.');
    }
  };

  const getBlob = async (uri) => {
    // Ensure the URI is valid and fetchable
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error('Failed to fetch the image from the given URI.');
    }
    return await response.blob();
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      Alert.alert('List Name Required', 'Please enter a name for the new shopping list.');
      return;
    }
    const listName = newListName.trim();
    const items = []; //empty array of items
    try {
      const listId = await createShoppingList(userData.email, listName, items);
      console.log('New list created with ID:', listId);
      setNewListName('');
    } catch (error) {
      console.error('Error creating shopping list:', error);
    }
  };

  const handleDeleteList = async (listId) => {
    const confirmDelete = await Alert.alert(
      'Delete Shopping List',
      'Are you sure you want to delete this shopping list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteShoppingList(userData.email, listId);
              console.log('Shopping list deleted successfully');
            } catch (error) {
              console.error('Error deleting shopping list:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Render loading indicator if data is still loading */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <TouchableOpacity onPress={handleChooseImage}>
            {/* Render profile image or placeholder */}
            <View style={styles.imageContainer}>
              {userData && userData.photoURL ? (
                <Image source={{ uri: userData.photoURL }} style={styles.profileImage} />
              ) : (
                <Text style={styles.placeholderText}>Add Profile Picture</Text>
              )}
            </View>
          </TouchableOpacity>

          {userData && (
            <View style={styles.header}>
              <Text style={styles.username}>{userData.displayName}</Text>
              <Text style={styles.email}>{userData.email}</Text>
            </View>
          )}

          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionItem} onPress={handleEditProfile}>
              <View style={styles.buttonContainer}>
                <Text style={styles.optionText}>ערוך פרופיל</Text>
                <FontAwesome name="edit" size={20} style={styles.buttonIcon} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('MyLists')}>
              <View style={styles.buttonContainer}>
                <Text style={styles.optionText}>הרשימות שלי</Text>
                <FontAwesome name="list" size={20} style={styles.buttonIcon} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('Help')}>
              <View style={styles.buttonContainer}>
                <Text style={styles.optionText}>עזרה</Text>
                <FontAwesome name="question" size={20} style={styles.buttonIcon} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem} onPress={handleSignOut}>
              <View style={styles.buttonContainer}>
                <Text style={styles.optionText}>התנתק</Text>
                <FontAwesome name="sign-out" size={20} style={styles.buttonIcon} />
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginLeft: 130
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 70,
    // marginBottom: 20,
  },
  email: {
    fontSize: 14,
    color: 'gray',
  },
  optionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 20,
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  optionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  optionText: {
    fontSize: 15, // Increased text size
    fontWeight: 'bold',
    marginLeft: 220,

  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  createButton: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
  },

  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginlift:80, // Adjust as needed
    paddingHorizontal: 10
  },
  
});


// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator, TextInput } from 'react-native';
// import firebase, { auth, firestore, getUserDocument, createShoppingList, deleteShoppingList } from './../firebase';
// import * as ImagePicker from 'expo-image-picker';
// import { FontAwesome } from '@expo/vector-icons';

// const ProfileScreen = ({ navigation }) => {
//   const [userData, setUserData] = useState(null);
//   const [newListName, setNewListName] = useState('');
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       const currentUser = auth.currentUser;
//       if (currentUser) {
//         const userDocument = await getUserDocument(currentUser.uid);
//         setUserData(userDocument);
//         setIsLoading(false);
//       }
//     };
//     fetchUserData();
//   }, []);

//   const handleEditProfile = () => {
//     navigation.navigate('EditProfile', { userData });
//   };

//   const handleSignOut = async () => {
//     try {
//       await auth.signOut();
//       navigation.navigate('Welcome');
//     } catch (error) {
//       console.error('Error signing out:', error);
//     }
//   };

//   const handleChooseImage = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission Denied', 'Permission to access media library is required!');
//       return;
//     }

//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       await saveImageToStorage(result.uri);
//     }
//   };

//   const saveImageToStorage = async (uri) => {
//     try {
//       const currentUser = auth.currentUser;
      
//       // Convert the image URI to a Blob
//       const blob = await getBlob(uri);

//       const imageRef = firebase.storage().ref().child(`profile_photos/${currentUser.uid}`);
//       await imageRef.put(blob);
//       const downloadURL = await imageRef.getDownloadURL();

//       // Update user's photoURL in Firebase Authentication
//       await currentUser.updateProfile({ photoURL: downloadURL });

//       // Update local user data
//       setUserData({ ...userData, photoURL: downloadURL });
//     } catch (error) {
//       console.error('Error saving image to storage:', error);
//       Alert.alert('Error', 'Failed to upload the image. Please try again.');
//     }
//   };

//   const getBlob = async (uri) => {
//     // Ensure the URI is valid and fetchable
//     const response = await fetch(uri);
//     if (!response.ok) {
//       throw new Error('Failed to fetch the image from the given URI.');
//     }
//     return await response.blob();
//   };

//   const handleCreateList = async () => {
//     if (!newListName.trim()) {
//       Alert.alert('List Name Required', 'Please enter a name for the new shopping list.');
//       return;
//     }
//     const listName = newListName.trim();
//     const items = []; // empty array of items
//     try {
//       const listId = await createShoppingList(userData.email, listName, items);
//       console.log('New list created with ID:', listId);
//       setNewListName('');
//     } catch (error) {
//       console.error('Error creating shopping list:', error);
//     }
//   };

//   const handleDeleteList = async (listId) => {
//     Alert.alert(
//       'Delete Shopping List',
//       'Are you sure you want to delete this shopping list?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           onPress: async () => {
//             try {
//               await deleteShoppingList(userData.email, listId);
//               console.log('Shopping list deleted successfully');
//             } catch (error) {
//               console.error('Error deleting shopping list:', error);
//             }
//           },
//         },
//       ]
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {isLoading ? (
//         <ActivityIndicator size="large" color="#0000ff" />
//       ) : (
//         <>
//           <TouchableOpacity onPress={handleChooseImage}>
//             <View style={styles.imageContainer}>
//               {userData && userData.photoURL ? (
//                 <Image source={{ uri: userData.photoURL }} style={styles.profileImage} />
//               ) : (
//                 <Text style={styles.placeholderText}>Add Profile Picture</Text>
//               )}
//             </View>
//           </TouchableOpacity>

//           {userData && (
//             <View style={styles.header}>
//               <Text style={styles.username}>{userData.displayName}</Text>
//               <Text style={styles.email}>{userData.email}</Text>
//             </View>
//           )}

//           <View style={styles.inputContainer}>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter new list name"
//               value={newListName}
//               onChangeText={setNewListName}
//             />
//             <TouchableOpacity style={styles.createButton} onPress={handleCreateList}>
//               <Text style={styles.createButtonText}>Create List</Text>
//             </TouchableOpacity>
//           </View>

//           <View style={styles.optionsContainer}>
//             <TouchableOpacity style={styles.optionItem} onPress={handleEditProfile}>
//               <View style={styles.buttonContainer}>
//                 <Text style={styles.optionText}>ערוך פרופיל</Text>
//                 <FontAwesome name="edit" size={20} style={styles.buttonIcon} />
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('MyLists')}>
//               <View style={styles.buttonContainer}>
//                 <Text style={styles.optionText}>הרשימות שלי</Text>
//                 <FontAwesome name="list" size={20} style={styles.buttonIcon} />
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('Help')}>
//               <View style={styles.buttonContainer}>
//                 <Text style={styles.optionText}>עזרה</Text>
//                 <FontAwesome name="question" size={20} style={styles.buttonIcon} />
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.optionItem} onPress={handleSignOut}>
//               <View style={styles.buttonContainer}>
//                 <Text style={styles.optionText}>התנתק</Text>
//                 <FontAwesome name="sign-out" size={20} style={styles.buttonIcon} />
//               </View>
//             </TouchableOpacity>
//           </View>
//         </>
//       )}
//     </View>
//   );
// };

// export default ProfileScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     marginTop: 100,
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   imageContainer: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: '#ccc',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//     marginLeft: 'auto',
//     marginRight: 'auto',
//   },
//   username: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   profileImage: {
//     width: 130,
//     height: 130,
//     borderRadius: 70,
//   },
//   email: {
//     fontSize: 14,
//     color: 'gray',
//   },
//   optionsContainer: {
//     borderTopWidth: 1,
//     borderTopColor: '#e0e0e0',
//     paddingTop: 20,
//     flexDirection: 'column',
//     alignItems: 'flex-start',
//     marginBottom: 10,
//   },
//   optionItem: {
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//     width: '100%',
//   },
//   optionText: {
//     fontSize: 15, 
//     fontWeight: 'bold',
//     marginLeft: 20,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   input: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     marginRight: 10,
//   },
//   createButton: {
//     backgroundColor: 'blue',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   createButtonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   buttonIcon: {
//     marginLeft: 10,
//   },
// });

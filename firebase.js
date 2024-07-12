import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/database';
import 'firebase/compat/storage';
import axios from 'axios';

const apiKeys = [
  'AIzaSyDRY1GfMPC8hjkZErTm8sa_P0484teqmGU',
  'AIzaSyAwtcAodl_4QdvERIqBVW4kZlNkYmCU64s',
  'AIzaSyCeKZ48A1S8gPx9vFNQj88NtddMPJwhgOw',
  'AIzaSyBm7EpqydsmGjWD_o438DeDVcS7PivzOLA',
  'AIzaSyBfmtB30gcGtn9cz4CaMSX4zkDUbfyngcc',
  'AIzaSyARYW0U9DMOkW2fVl8r6-3H8AzlPRa5cCE'
];
const cx = '84597da9d23754ba9';

let currentApiKeyIndex = 0;

const firebaseConfig = {
  apiKey: "AIzaSyCLBP1DtXiz-daQl1bHRnJXhd0t7W1m3Ww",
  authDomain: "todolist-84c80.firebaseapp.com",
  projectId: "todolist-84c80",
  storageBucket: "todolist-84c80.appspot.com",
  messagingSenderId: "268694599173",
  appId: "1:268694599173:web:741db0f89abc76a4b84e6c",
  measurementId: "G-H1ZH8VSTLF"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const database = firebase.database();
export const storage = firebase.storage();
export const fieldValue = firebase.firestore.FieldValue;

// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// const getNextApiKey = () => {
//   currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length;
//   return apiKeys[currentApiKeyIndex];
// };

// export const fetchImageUrl = async (query) => {
//   const url = `https://www.googleapis.com/customsearch/v1?q=${query}&cx=${cx}&key=${getNextApiKey()}&searchType=image&num=1`;
//   try {
//     const response = await axios.get(url);
//     const data = response.data;
//     if (data.items && data.items.length > 0) {
//       const imageUrl = data.items[0].link;
//       const isValidFormat = /\.(jpg|jpeg|png)$/.test(imageUrl.toLowerCase());
//       if (isValidFormat) {
//         return imageUrl;
//       }
//     }
//   } catch (error) {
//     console.error('Error fetching image URL:', error);
//     if (error.response && error.response.status === 429) {
//       throw new Error('Rate limit hit');
//     }
//   }
//   return null;
// };

// export const updateProductImages = async () => {
//   const supermarketNames = ['Ramilevi','Yochananof', 'Osherad', 'Ramilevi', 'Shupersal', 'Tivtaam','Victory'];
//   const batchSize = 5;
//   const maxRetry = 5;

//   for (const supermarket of supermarketNames) {
//     const snapshot = await database.ref(`${supermarket}`).once('value');
//     const items = snapshot.val();
//     const itemKeys = Object.keys(items);

//     for (let i = 0; i < itemKeys.length; i += batchSize) {
//       const batch = itemKeys.slice(i, i + batchSize);
//       let retry = 0;

//       for (const key of batch) {
//         const item = items[key];
//         if (item.ItemCode && !item.imageUrl) {
//           let success = false;

//           while (!success && retry < maxRetry) {
//             try {
//               let imageUrl = await fetchImageUrl(item.ItemCode);
//               if (imageUrl) {
//                 await database.ref(`${supermarket}/${key}`).update({ imageUrl });
//                 console.log(`Updated ${item.ItemCode} with image URL: ${imageUrl}`);
//                 success = true;
//               }
//             } catch (error) {
//               if (error.message === 'Rate limit hit') {
//                 retry += 1;
//                 const waitTime = Math.min(60 * 1000, Math.pow(2, retry) * 1000);
//                 console.log(`Rate limit hit, waiting ${waitTime / 1000} seconds...`);
//                 await sleep(waitTime);
//               } else {
//                 console.error(`Error updating item ${item.ItemCode}:`, error);
//                 success = true;
//               }
//             }
//           }

//           await sleep(500);
//         }
//       }
//     }
//   }
// };

// updateProductImages().then(() => {
//   console.log('Product images updated successfully.');
// }).catch((error) => {
//   console.error('Error updating product images:', error);
// });

// const categorizeItems = async () => {
//   const supermarkets = ['Yochananof'];
// // , 'Osherad', 'Ramilevi', 'Shupersal', 'Tivtaam'
//   for (const supermarket of supermarkets) {
//     const snapshot = await database.ref(supermarket).once('value');
//     const items = snapshot.val();

//     if (!items) continue;

//     for (const key in items) {
//       if (items.hasOwnProperty(key)) {
//         const item = items[key];
//         let category = 'אחר';

//         // Bakery and Pastry
//         if (['קמח מלכים', 'מאפית י את א ברמן בע', 'המחמצת', 'מימונס אפיה','גידרון'].some(name => item.ManufacturerName.includes(name)) ||
//           ['עוגיות','לחם'].some(name => item.ItemName.includes(name))) {
//           category = 'מאפייה ומאפים';
//         }
//         // Cleaning and Pharmacy
//         else if (['יעקב יעקובי', 'פרוקטר & גמבל', 'פישר מעבדות פרמצבטיו', 'קרליין', 'סנו', 'איירוויק','פרוקטר אנד גמבל'].some(name => item.ManufacturerName.includes(name)) ||
//           ['דאב', 'איירוויק', 'סבון','בישום','פיניש','פמפרס','פרסיל','מרכך','שמפו','אולוויז'].some(name => item.ItemName.includes(name))) {
//           category = 'ניקוי הברקה ופארם';
//         }
//         // Fruits and Vegetables
//         else if (['א.מ שרון', 'גרין האוס', 'ביכורי השקמה','*222219','א.אדמה','משתנה'].some(name => item.ManufacturerName.toLowerCase().includes(name.toLowerCase()))
//           || ['ישראל'].some(name => item.ItemName.includes(name))) {
//           category = 'פרות וירקות';
//         }
//         // Chocolate and Candy
//         else if (['אסקום בעבור שטראוס', 'מאיר בייגל', 'נאטרא', 'כרמית', 'ארקור', 'סאדת גידה','סוכרזית'].some(name => item.ManufacturerName.includes(name)) ||
//           ['שטראוס גרופ', 'בטר אנד דיפרנט', 'שוקולד', 'סוכריות', 'וופל','קליק','מנטוס','ביסקוויט'].some(name => item.ItemName.includes(name))) {
//           category = 'שוקולד וממתקים';
//         }
//         // Drinks, Wine, and Alcohol
//         else if (['קוקה', 'יקב בראשית', 'יקב עמק יזרעאל', 'יקבי כרמל'].some(name => item.ManufacturerName.includes(name)) ||
//           ['יין', 'בירה', 'מיץ', 'סודה','שוופס','ווין','פפסי','ליפטון','קפה טורקי'].some(name => item.ItemName.includes(name))) {
//           category = 'משקאות יין ואלכוהול';
//         }
//         // Dairy and Eggs
//         else if (['מחלבת', 'תנובה', 'טרה','*201890','*203760'].some(name => item.ManufacturerName.toLowerCase().includes(name.toLowerCase())) ||
//           ['משקה שיבולת', 'גבינת','אקטיביה'].some(name => item.ItemName.includes(name))) {
//           category = 'מוצרי חלב ובצים';
//         }
//         // Nuts and Dried Fruits
//         else if (item.ManufacturerName.toLowerCase().includes('דין שיווק') || 
//          ['ביסלי', 'פיצוחים','חטיף','ציטוס','בייגלה','דוריטוס'].some(name => item.ItemName.includes(name))) {
//           category = ' פיצוחים ופירות יבשים וחטיפים';
//         }
//         // Meat and Poultry
//         else if (['זוגלובק', 'עוף'].some(name => item.ManufacturerName.toLowerCase().includes(name.toLowerCase())) ||
//           item.ItemName.includes('בשר')) {
//           category = 'בשר ועופות';
//         }
//         // Cooking, Canned Food, and Preserved Food
//         else if (['סוגת', 'שקדיה', 'גנדלוס','תבלינים','יד מרדכי'].some(name => item.ManufacturerName.toLowerCase().includes(name.toLowerCase())) ||
//           ['סויה', 'חוואיג', 'רוטב', 'מלח','אורגנו','נודלס','פסטה','אורז','מאכל','מיונז'].some(name => item.ItemName.includes(name))) {
//           category = 'בישול מזון מקורר ושימורים';
//         }
//         // Household and Disposable Products
//         else if (item.ManufacturerName.includes('פאלאס') || item.ItemName.includes('נייר')) {
//           category = 'מוצרי בית וחד פעמי';
//         }

//         await database.ref(`${supermarket}/${key}`).update({ Category: category });
//       }
//     }
//   }

//   console.log('Categorization complete');
// };

// categorizeItems().catch(console.error);

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

export const getUserDocument = async (uid) => {
  if (!uid) return null;

  try {
    const userDocument = await firestore.doc(`users/${uid}`).get();
    return { uid, ...userDocument.data() };
  } catch (error) {
    console.error('Error fetching user document:', error);
    return null;
  }
};

export const getItemsBySupermarket = async (supermarket) => {
  try {
    const snapshot = await firebase.database().ref(`${supermarket}`).once('value');
    const itemsData = snapshot.val();
    const itemsArray = Object.keys(itemsData).map((key) => ({
      id: key,
      ...itemsData[key],
    }));
    return itemsArray;
  } catch (error) {
    console.error('Error fetching items:', error);
    return [];
  }
};

export const getItemsFromAllSupermarkets = async () => {
  const supermarketNames = ['Yochananof', 'Osherad', 'Ramilevi', 'Shupersal', 'Tivtaam','Victory'];
  // 
  const items = {};

  for (const supermarket of supermarketNames) {
    const snapshot = await database.ref(`${supermarket}`).once('value');
    items[supermarket] = snapshot.val();
  }

  return items;
};

export const searchItemAcrossSupermarkets = (items, itemCode) => {
  const results = [];

  for (const [supermarket, itemList] of Object.entries(items)) {
    for (const item of itemList) {
      if (item.ItemCode === itemCode) {
        results.push({
          supermarket,
          itemCode: item.ItemCode,
          itemName: item.ItemName,
          itemPrice: item.ItemPrice,
          availability: true
        });
      }
    }
  }

  return results;
};

export const uploadProfileImage = async (uri, userId) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const ref = storage.ref().child(`profile_images/${userId}`);
    await ref.put(blob);
    return await ref.getDownloadURL();
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

export const updateUserProfileImage = async (userId, imageUrl) => {
  try {
    const userRef = firestore.doc(`users/${userId}`);
    await userRef.update({ photoURL: imageUrl });
  } catch (error) {
    console.error('Error updating user profile image:', error);
    throw error;
  }
};

export const deleteUserProfileImage = async (uid) => {
  const userRef = firestore.collection('users').doc(uid);
  await userRef.update({
    photoURL: firebase.firestore.FieldValue.delete()
  });
};

export default firebase;


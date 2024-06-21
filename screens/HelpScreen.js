// // HelpScreen.js
// import React from 'react';
// import { View, Text, StyleSheet, ScrollView } from 'react-native';

// const HelpScreen = () => {
//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.header}>כיצד להשתמש באפליקציה</Text>
      
//       <Text style={styles.subheader}>1. הוספת מוצרים לרשימת קניות</Text>
//       <Text style={styles.text}>- היכנס למסך 'רשימת מוצרים' ובחר את המוצרים שברצונך להוסיף על ידי לחיצה על כפתור ה'+' שליד כל מוצר.</Text>

//       <Text style={styles.subheader}>2. יצירת רשימת קניות חדשה</Text>
//       <Text style={styles.text}>- במסך 'רשימות סופרמרקט', לחץ על הכפתור 'ליצור רשימה חדשה'. הזן את שם הרשימה ולחץ על אישור.</Text>
      
//       <Text style={styles.subheader}>3. שיתוף רשימת קניות</Text>
//       <Text style={styles.text}>- במסך 'רשימת קניות', הזן את כתובת האימייל של בן המשפחה שברצונך לשתף איתו את הרשימה ולחץ על 'שתף'.</Text>
      
//       <Text style={styles.subheader}>4. השוואת מחירים</Text>
//       <Text style={styles.text}>- במסך 'רשימת מוצרים', לחץ על כפתור 'השוואת מחירים' שליד כל מוצר כדי לראות את המחירים בסופרמרקטים שונים.</Text>

//       <Text style={styles.subheader}>5. עזרה נוספת</Text>
//       <Text style={styles.text}>- לפניות נוספות, נא ליצור קשר עם התמיכה שלנו דרך האפליקציה.</Text>
//     </ScrollView>
//   );
// };

// export default HelpScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#fff',
//     marginTop:50
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   subheader: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     textAlign: 'right',

//   },
//   text: {
//     fontSize: 16,
//     marginBottom: 20,
//     textAlign: 'right',

//   },
// });

// screens/HelpScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const HelpScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>ברוכים הבאים לאפליקציית ניהול קניות משפחתית!</Text>
      
      <Text style={styles.sectionHeader}>התחלה</Text>
      <Text style={styles.text}>1. הירשם או היכנס לחשבון שלך.</Text>
      <Text style={styles.text}>2. צור רשימת קניות חדשה על ידי ניווט לסעיף 'צור רשימה'.</Text>
      <Text style={styles.text}>3. הוסף פריטים לרשימה שלך על ידי חיפוש מוצרים ובחירתם.</Text>

      <Text style={styles.sectionHeader}>ניהול פרופיל</Text>
      <Text style={styles.text}>1. צפה וערוך את הפרופיל שלך על ידי ניווט לסעיף 'פרופיל'.</Text>
      {/* <Text style={styles.text}>2. עדכן את תמונת הפרופיל שלך על ידי לחיצה על התמונה הנוכחית ובחירת חדשה.</Text> */}

      <Text style={styles.sectionHeader}>שיתוף רשימות</Text>
      <Text style={styles.text}>1. שתף את הרשימות שלך עם בני משפחה על ידי ניווט לסעיף 'שתף רשימה'.</Text>
      <Text style={styles.text}>2. הכנס את כתובת האימייל של האדם שאתה רוצה לשתף איתו את הרשימה.</Text>

      <Text style={styles.sectionHeader}>השוואת מחירים</Text>
      <Text style={styles.text}>1. השווה מחירי מוצרים בין סופרמרקטים שונים על ידי ניווט לסעיף 'השוואת מחירים'.</Text>
      <Text style={styles.text}>2. בחר מוצר כדי לצפות במחיריו בסופרמרקטים שונים.</Text>

      {/* <Text style={styles.sectionHeader}>עזרה ותמיכה</Text>
      <Text style={styles.text}>לעזרה נוספת, צור קשר עם צוות התמיכה שלנו בכתובת support@example.com.</Text> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    marginTop:40
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign:'right'
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    textAlign:'right'

  },
});

export default HelpScreen;
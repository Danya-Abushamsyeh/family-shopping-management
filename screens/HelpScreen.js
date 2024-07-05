import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

const HelpScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>עזרה והנחיות שימוש באפליקציה</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>רישום והתחברות</Text>
        <Text style={styles.text}>
          - כדי להתחיל להשתמש באפליקציה, עליך להירשם עם כתובת הדוא"ל שלך.
          {"\n"} - לאחר הרישום, תוכל להתחבר באמצעות כתובת הדוא"ל והסיסמה שבחרת.
          {"\n"} - אם שכחת את הסיסמה, תוכל לאפס אותה על ידי לחיצה על "שכחתי סיסמה" בדף ההתחברות.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>יצירת רשימות קניות</Text>
        <Text style={styles.text}>
          - כדי ליצור רשימת קניות חדשה, בחר את הסופרמרקט הרצוי ולחץ על "צור רשימה חדשה".
          {"\n"} - תן שם לרשימה ולחץ על "אישור". כעת תוכל להוסיף פריטים לרשימה זו.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>הוספת פריטים לרשימה</Text>
        <Text style={styles.text}>
          - כדי להוסיף פריט לרשימה, עליך לבחור לאיזו רשימה ברצונך להוסיף 
          {"\n"} - לחץ על כפתור "+" להוסיף להרשימה.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>שיתוף רשימות קניות</Text>
        <Text style={styles.text}>
          - ניתן לשתף רשימות קניות עם בני משפחה על ידי בחירת בן משפחה מרשימת אנשי הקשר או לשתף עם כולם.
          {"\n"} - בן המשפחה המשותף יוכל לעדכן את הרשימה בזמן אמת.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>השוואת מחירים</Text>
        <Text style={styles.text}>
          - האפליקציה מאפשרת להשוות מחירים בין סופרמרקטים שונים.
          {"\n"} - בחר את הרשימה שברצונך להשוות ולחץ על "השווה מחירים".
          {"\n"} - תוצג לך רשימת הסופרמרקטים עם המחירים השונים, מה שיאפשר לך לבחור את הסופרמרקט המשתלם ביותר.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ניהול פרופיל</Text>
        <Text style={styles.text}>
          - ניתן לעדכן את פרטי הפרופיל, כולל תמונת הפרופיל.
          {"\n"} - הכנס לדף הפרופיל שלך ולחץ על "ערוך פרופיל".
          {"\n"} - עדכן את הפרטים הרצויים ושמור את השינויים.
        </Text>
      </View>

      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome name="arrow-left" style={styles.backIcon} />
          <Text style={styles.backText}>חזור</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    marginTop:35
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign:'right'
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    textAlign:'right'

  },
  backButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e9a1a1',
    borderRadius: 5,
    width:'50%',
  },
  backIcon: {
    fontSize: 20,
    color: '#fff',
    marginRight: 10,
  },
  backText: {
    fontSize: 16,
    color: '#fff',
    left:35
  },
});

export default HelpScreen;

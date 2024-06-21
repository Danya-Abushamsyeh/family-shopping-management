import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { auth, firestore, fieldValue } from './../firebase';

const AddFamilyMember = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setCurrentUserId(currentUser.uid);
        const userRef = firestore.collection('users').doc(currentUser.uid);
        const userData = (await userRef.get()).data();
        const family = userData.family || [];
        const familyMemberPromises = family.map(async memberId => {
          const memberData = (await firestore.collection('users').doc(memberId).get()).data();
          return { id: memberId, email: memberData.email, displayName: memberData.displayName };
        });
        const familyMembersData = await Promise.all(familyMemberPromises);
        setFamilyMembers(familyMembersData);
      }
    };
    fetchFamilyMembers();
  }, [loading]);

  const addFamilyMember = async () => {
    if (!email) {
      Alert.alert('שגיאה', 'אנא הכנס כתובת אימייל.');
      return;
    }

    const currentUser = auth.currentUser;
    if (currentUser) {
      setLoading(true);
      try {
        const userSnapshot = await firestore.collection('users').where('email', '==', email).get();
        if (userSnapshot.empty) {
          Alert.alert('שגיאה', 'לא נמצא משתמש עם כתובת אימייל זו.');
          setLoading(false);
          return;
        }

        const familyMemberId = userSnapshot.docs[0].id;

        const currentUserRef = firestore.collection('users').doc(currentUser.uid);
        const currentUserData = (await currentUserRef.get()).data();
        const family = currentUserData.family || [];

        if (!family.includes(familyMemberId)) {
          await currentUserRef.update({
            family: fieldValue.arrayUnion(familyMemberId)
          });

          const familyMemberRef = firestore.collection('users').doc(familyMemberId);
          const familyMemberData = (await familyMemberRef.get()).data();
          const familyMemberFamily = familyMemberData.family || [];

          if (!familyMemberFamily.includes(currentUser.uid)) {
            await familyMemberRef.update({
              family: fieldValue.arrayUnion(currentUser.uid)
            });
          }

          setFamilyMembers([...familyMembers, { id: familyMemberId, email, displayName: familyMemberData.displayName }]);
          Alert.alert('הצלחה', `${familyMemberData.displayName} (${email}) נוסף כחבר משפחה.`);
        } else {
          Alert.alert('מידע', `${email} כבר נמצא כחבר משפחה.`);
        }
      } catch (error) {
        console.error('שגיאה בהוספת חבר משפחה:', error);
        Alert.alert('שגיאה', 'נכשל בהוספת חבר משפחה. נסה שוב מאוחר יותר.');
      } finally {
        setLoading(false);
      }
    }
  };

  const removeFamilyMember = async (memberId) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setLoading(true);
      try {
        const currentUserRef = firestore.collection('users').doc(currentUser.uid);
        const currentUserData = (await currentUserRef.get()).data();
        const updatedFamily = currentUserData.family.filter(id => id !== memberId);

        await currentUserRef.update({ family: updatedFamily });

        const familyMemberRef = firestore.collection('users').doc(memberId);
        const familyMemberData = (await familyMemberRef.get()).data();
        const updatedMemberFamily = familyMemberData.family.filter(id => id !== currentUser.uid);

        await familyMemberRef.update({ family: updatedMemberFamily });

        setFamilyMembers(familyMembers.filter(member => member.id !== memberId));
        Alert.alert('הצלחה', 'חבר משפחה הוסר בהצלחה.');
      } catch (error) {
        console.error('שגיאה בהסרת חבר משפחה:', error);
        Alert.alert('שגיאה', 'נכשל בהסרת חבר משפחה. נסה שוב מאוחר יותר.');
      } finally {
        setLoading(false);
      }
    }
  };

  const renderFamilyMember = ({ item }) => (
    <View style={styles.familyMemberContainer}>
      <Text>{item.displayName} ({item.email})</Text>
      <TouchableOpacity onPress={() => removeFamilyMember(item.id)} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>הסר</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>הכנס את כתובת האימייל של חבר המשפחה:</Text>
      <TextInput
        style={styles.input}
        placeholder="אימייל"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.button} onPress={addFamilyMember} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>הוסף חבר משפחה</Text>}
      </TouchableOpacity>
      <Text style={styles.label}>חברי המשפחה שלי</Text>
      <FlatList
        data={familyMembers}
        keyExtractor={item => item.id}
        renderItem={renderFamilyMember}
        ListEmptyComponent={<Text>לא נוספו חברי משפחה עדיין.</Text>}
      />
    </View>
  );
};

export default AddFamilyMember;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    marginTop: 130,
  },
  label: {
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#635A5A',
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
    borderRadius: 99,
    marginTop: 20,
    marginBottom: 60,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  familyMemberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  removeButton: {
    backgroundColor: '#ff3b30',
    padding: 5,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#fff',
  },
});

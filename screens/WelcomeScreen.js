import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen = () => {
    const navigation = useNavigation();
    const handleLetsGetStartedPress = () => {
        navigation.navigate('TabNavigation');
      };
  return (
<View style={{alignItems:'center'}}>
      <Image source={require('./../assets/images/log.png')} 
        style={styles.loginImage}
      />  
      <View style={styles.subContainer}>
        <Text style={{fontSize:33, color:'#464444', fontWeight:'bold',textAlign:'center'}}>
        הכן את רשימת הקניות שלך עם משפחתך
        </Text>
        <Text>
        </Text>
        <Text style={{fontSize:15, color:'#464444',textAlign:'center'}}>
        האפליקציה הטובה ביותר לניהול הרכישות המשפחתיות שלך       
        </Text>
        <Text>
        </Text>
        <TouchableOpacity style={styles.button}
           onPress={handleLetsGetStartedPress}          >
           <Text style={{textAlign:'center',fontSize:17,color:'#ffffff',shadowColor:'#ffffff'}}>
           בואו נתחיל           
           </Text>
        </TouchableOpacity>
        </View>
    </View>
  )
}

export default WelcomeScreen

const styles = StyleSheet.create({
    loginImage:{
       width:410,
       height:400,
    },
    subContainer:{
      width:'120%',
      height:'60%',
      backgroundColor: '#e9a1a1',
      marginTop:-10,
      padding:50
    },
    button:{
      padding:15,
      backgroundColor:'#635A5A',
      borderRadius:99,
      marginTop:60

    }


})
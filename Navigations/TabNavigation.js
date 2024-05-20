import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; 
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ItemsScreen from '../screens/ItemsScreen';
import EditProfileScreen from '../screens/EditProfile';
import ShoppingList from '../screens/ShoppingList';
import signup from '../screens/Signup';
import React, { useState } from 'react';
import ListsScreen from '../screens/ListsScreen';

const Tab = createBottomTabNavigator();

const TabNavigation = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ size, focused }) => {
          let iconName;
          const iconColor = focused ? '#da6363' : '#808080'; 

          if (route.name === 'התחברות') {
            iconName = focused ? 'sign-in' : 'sign-in'; 
          }else 
          if (route.name === 'בית') {
            iconName = focused ? 'home' : 'home'; 
          } else if (route.name === 'פרופיל') {
            iconName = focused ? 'user' : 'user'; 
          }
          return <FontAwesome name={iconName} size={size} color={iconColor}  />;
        },
      })}
      
    >
      
      {/* <Tab.Screen name='התחברות' component={LoginScreen} options={{ headerShown: false,tabBarItemStyle:{paddingHorizontal:70, paddingStart:63} }}/> */}
      <Tab.Screen name='בית' component={HomeScreen} options={{ headerShown: false,tabBarItemStyle:{paddingHorizontal:100}}} />
      <Tab.Screen name='פרופיל' component={ProfileScreen} options={{ headerShown: false,tabBarIconStyle:{left:40},tabBarLabelStyle:{left:40}}}/>
      
      <Tab.Screen name='EditProfile' component={EditProfileScreen} options={{ headerShown: false,tabBarLabelStyle:{marginLeft:300 },tabBarIconStyle:{marginLeft:300 },tabBarItemStyle:{left:300} }}/>
      <Tab.Screen name='signup' component={signup} options={{ headerShown: false,tabBarLabelStyle:{marginLeft:300 },tabBarIconStyle:{marginLeft:300 },tabBarItemStyle:{left:300}}}/>
      <Tab.Screen name='Items' component={ItemsScreen} options={{ headerShown: false,tabBarLabelStyle:{marginLeft:300 },tabBarIconStyle:{marginLeft:300 },tabBarItemStyle:{left:300}}}/>
      <Tab.Screen name='Lists' component={ListsScreen} options={{ headerShown: false,tabBarLabelStyle:{marginLeft:300 },tabBarIconStyle:{marginLeft:300 },tabBarItemStyle:{left:300}}}/>
      <Tab.Screen name='ShoppingList' component={ShoppingList} options={{ headerShown: false,tabBarLabelStyle:{marginLeft:300 },tabBarIconStyle:{marginLeft:300 },tabBarItemStyle:{left:300}}}/>

    </Tab.Navigator>
  );
};

export default TabNavigation;

const styles = StyleSheet.create({});
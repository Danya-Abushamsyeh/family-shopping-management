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
import SupermarketListsScreen  from '../screens/SupermarketListsScreen';
import ListItemsScreen   from '../screens/ListItemsScreen';
import ShareListScreen from '../screens/ShareListScreen';
import AddFamilyMember from '../screens/AddFamilyMember';

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
      <Tab.Screen name='בית' component={HomeScreen} options={{ headerShown: false,tabBarItemStyle:{paddingHorizontal:80}}} />
      <Tab.Screen name='פרופיל' component={ProfileScreen} options={{ headerShown: false,tabBarIconStyle:{left:100},tabBarLabelStyle:{left:100}}}/>
      
      <Tab.Screen name='EditProfile' component={EditProfileScreen} options={{ headerShown: false,tabBarLabelStyle:{marginLeft:500 },tabBarIconStyle:{marginLeft:300 },tabBarItemStyle:{left:300} }}/>
      <Tab.Screen name='signup' component={signup} options={{ headerShown: false,tabBarLabelStyle:{marginLeft:300 },tabBarIconStyle:{marginLeft:300 },tabBarItemStyle:{left:300}}}/>
      <Tab.Screen name='Items' component={ItemsScreen} options={{ headerShown: false,tabBarLabelStyle:{marginLeft:300 },tabBarIconStyle:{marginLeft:300 },tabBarItemStyle:{left:300}}}/>
      {/* <Tab.Screen name='Lists' component={ListsScreen} options={{ headerShown: false,tabBarLabelStyle:{marginLeft:300 },tabBarIconStyle:{marginLeft:300 },tabBarItemStyle:{left:300}}}/> */}
      <Tab.Screen name='ShoppingList' component={ShoppingList} options={{ headerShown: false,tabBarLabelStyle:{marginLeft:300 },tabBarIconStyle:{marginLeft:300 },tabBarItemStyle:{left:300}}}/>
      <Tab.Screen name='SupermarketLists' component={SupermarketListsScreen} options={{ headerShown: false,tabBarLabelStyle:{marginLeft:500 },tabBarIconStyle:{marginLeft:500 },tabBarItemStyle:{left:500}}}/>
      <Tab.Screen name='ListItems' component={ListItemsScreen} options={{ headerShown: false,tabBarLabelStyle:{marginLeft:500 },tabBarIconStyle:{marginLeft:500 },tabBarItemStyle:{left:500}}}/>
      <Tab.Screen name='ShareList' component={ShareListScreen} options={{ headerShown: false,tabBarLabelStyle:{marginLeft:500 },tabBarIconStyle:{marginLeft:500 },tabBarItemStyle:{left:500}}}/>
      <Tab.Screen name='AddFamilyMember' component={AddFamilyMember} options={{ headerShown: false,tabBarLabelStyle:{marginLeft:500 },tabBarIconStyle:{marginLeft:500 },tabBarItemStyle:{left:500}}}/>

    </Tab.Navigator>
  );
};

export default TabNavigation;

const styles = StyleSheet.create({});
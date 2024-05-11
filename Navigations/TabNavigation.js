import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import React from 'react';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ShoppingList from '../screens/ShoppingList'; // Corrected import statement
import { faList, faUser, faHome, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

const Tab = createBottomTabNavigator();

const TabNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ size, focused }) => {
          let iconComponent;
          const iconColor = focused ? '#da6363' : '#808080'; 

          if (route.name === 'Login') {
            iconComponent = <FontAwesomeIcon icon={faSignInAlt} style={[styles.icon, { color: iconColor }]} size={size} />;
          } 
          else if (route.name === 'ShoppingList') {
            iconComponent = <FontAwesomeIcon icon={faList} style={[styles.icon, { color: iconColor }]} size={size} />;
          } 
          else if (route.name === 'Home') {
            iconComponent = <FontAwesomeIcon icon={faHome} style={[styles.icon, { color: iconColor }]} size={size} />;
          } 
          else if (route.name === 'Profile') {
            iconComponent = <FontAwesomeIcon icon={faUser} style={[styles.icon, { color: iconColor }]} size={size} />;
          }
          return iconComponent;
        },
      })}
    >
      <Tab.Screen name='Login' component={LoginScreen} options={{ headerShown: false }}/>
      <Tab.Screen name='ShoppingList' component={ShoppingList} options={{ headerShown: false }}/>
      <Tab.Screen name='Home' component={HomeScreen} options={{ headerShown: false }}/>
      <Tab.Screen name='Profile' component={ProfileScreen} options={{ headerShown: false }}/>

    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({});

export default TabNavigation;

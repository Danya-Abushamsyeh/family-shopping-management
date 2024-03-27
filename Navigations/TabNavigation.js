import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigation = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name='Login' component={LoginScreen}  />
      <Tab.Screen name='Home' component={HomeScreen}  />
      <Tab.Screen name='Profile' component={ProfileScreen}  />
    </Tab.Navigator>
  )
}

export default TabNavigation

const styles = StyleSheet.create({})
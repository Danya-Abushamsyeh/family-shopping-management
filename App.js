import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import TabNavigation from './Navigations/TabNavigation';
import ProfileScreen from './screens/ProfileScreen';
// import PriceComparisonScreen from './screens/PriceComparisonScreen';
// import Categories from './screens/Categories'
import ItemsScreen from './screens/ItemsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="TabNavigation" component={TabNavigation} />
        {/* <Stack.Screen name="product" component={PriceComparisonScreen} /> */}
        {/* <Stack.Screen name="Categories" component={Categories} /> */}
        <Stack.Screen name="Items" component={ItemsScreen} />    
      </Stack.Navigator>
    </NavigationContainer>
  );
}

